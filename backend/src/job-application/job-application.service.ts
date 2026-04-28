// src/job-application/job-application.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobApplication } from './job-application.entity';
import { JobOffer } from '../job-offer/job-offer.entity';
import { MlService } from '../ml/ml.service';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
@Injectable()
export class JobApplicationService {
  // ✅ Logger initialisé
  private readonly logger = new Logger(JobApplicationService.name);

  constructor(
    @InjectRepository(JobApplication)
    private appRepo: Repository<JobApplication>,
    @InjectRepository(JobOffer)
    private jobOfferRepo: Repository<JobOffer>,
    private mlService: MlService,
  ) {}

  private calculateMatchingScore(cvText: string, requiredSkills: string[]): number {
    if (!cvText || !requiredSkills?.length) return 0;
    const cvLower = cvText.toLowerCase();
    let matched = 0;
    for (const skill of requiredSkills) {
      if (cvLower.includes(skill.toLowerCase())) matched++;
    }
    return Math.round((matched / requiredSkills.length) * 100);
  }

  async apply(
    candidateId: number, 
    jobOfferId: number, 
    formData: any, 
    cvText?: string, 
    cvBuffer?: Buffer, 
    cvFilename?: string
  ): Promise<JobApplication> {
    
    const jobOffer = await this.jobOfferRepo.findOne({ 
      where: { id: jobOfferId, is_active: true } 
    });
    if (!jobOffer) throw new NotFoundException('Offre non trouvée ou inactive');

    // 🔹 LOG 1: Début du traitement
    this.logger.log(`📋 [SERVICE] === DÉBUT apply() ===`);
    this.logger.log(`📋 [SERVICE] Candidat: ${candidateId}, Offre: ${jobOfferId}`);
    this.logger.log(`📋 [SERVICE] Buffer CV: ${cvBuffer ? cvBuffer.length : 0} bytes`);

    const matchingScore = this.calculateMatchingScore(
      cvText || '',
      formData.required_skills || jobOffer.required_skills || []
    );

    // 🔹 APPEL AU SERVICE ML
    let mlResult: any = null;

    if (cvBuffer) {
      this.logger.log(`🔹 [SERVICE] Appel ML Service en cours...`);
      try {
        mlResult = await this.mlService.analyzeCvAndMatch(
          cvBuffer,
          jobOffer.title,
          jobOffer.description,
          jobOffer.required_skills || [],
        );
        
        // 🔹 LOG 2: Résultat reçu du ML Service
        this.logger.log(`🎯 [SERVICE] ML Result reçu:`, JSON.stringify({
          matching_score: mlResult?.matching_score,
          cv_classification: mlResult?.cv_classification,
          classification_confidence: mlResult?.classification_confidence,
          model_used: mlResult?.model_used,
          warning: mlResult?.warning,
          skills_count: mlResult?.skills_detected?.length
        }, null, 2));
        
      } catch (error) {
        // 🔹 LOG 3: Erreur lors de l'appel ML
        this.logger.error(`❌ [SERVICE] Erreur ML Service: ${error.message}`, error.stack);
        this.logger.warn(`⚠️ [SERVICE] Utilisation du fallback`);
      }
    } else {
      this.logger.warn(`⚠️ [SERVICE] Aucun buffer CV reçu - ML skip`);
    }

    // 🔹 LOG 4: Préparation des données pour la BDD
    this.logger.log(`💾 [SERVICE] Données à sauvegarder:`, {
      matching_score: mlResult?.matching_score ?? matchingScore,
      cv_classification: mlResult?.cv_classification,
      classification_confidence: mlResult?.classification_confidence,
      skills_detected_count: mlResult?.skills_detected?.length,
      ml_model_used: mlResult?.model_used
    });

    const application = this.appRepo.create({
      candidate_id: candidateId,
      job_offer_id: jobOfferId,
      cv_url: formData.cv_url,
      cv_filename: cvFilename || formData.cv_filename,
      cover_letter: formData.cover_letter,
      
      // Score IA: priorité au résultat ML, sinon fallback calculé
      matching_score: mlResult?.matching_score ?? matchingScore,
      
      matching_details: JSON.stringify({
        method: mlResult?.model_used || 'fallback-keyword',
        skills_match: mlResult?.matching_score,
        warning: mlResult?.warning || null,
      }),
      
      // ← NOUVEAUX CHAMPS ML
      cv_classification: mlResult?.cv_classification || null,
      classification_confidence: mlResult?.classification_confidence || null,
      classification_details: mlResult?.classification_top3 
        ? JSON.stringify(mlResult.classification_top3) 
        : null,
      skills_detected: mlResult?.skills_detected || [],
      ml_model_used: mlResult?.model_used || null,
      
      status: 'pending',
    });

    // 🔹 LOG 5: Sauvegarde en cours
    this.logger.log(`💾 [SERVICE] Sauvegarde en base de données...`);
    
    const saved = await this.appRepo.save(application);
    
    // 🔹 LOG 6: Sauvegarde terminée
    this.logger.log(`✅ [SERVICE] === FIN apply() === Candidature sauvegardée!`, {
      id: saved.id,
      matching_score: saved.matching_score,
      cv_classification: saved.cv_classification,
      ml_model_used: saved.ml_model_used
    });

    return saved;
  }

  async findByJobOffer(jobOfferId: number, recruiterId: number): Promise<JobApplication[]> {
    const offer = await this.jobOfferRepo.findOne({ 
      where: { id: jobOfferId, recruiter_id: recruiterId } 
    });
    if (!offer) throw new BadRequestException('Offre non trouvée ou accès refusé');
    return this.appRepo.find({ 
      where: { job_offer_id: jobOfferId }, 
      relations: ['candidate'], 
      order: { applied_at: 'DESC' } 
    });
  }

  async findByCandidate(candidateId: number): Promise<JobApplication[]> {
  return this.appRepo.find({ 
    where: { candidate_id: candidateId }, 
    relations: ['jobOffer'], 
    select: {
      id: true,
      status: true,
      scheduledAt: true, // ← AJOUTE CETTE LIGNE
      matching_score: true,
      applied_at: true,
      jobOffer: {
        id: true,
        title: true,
        employment_type: true,
        location: true,
      }
    },
    order: { applied_at: 'DESC' } 
  });
}

async updateStatus(applicationId: number, recruiterId: number, dto: UpdateApplicationStatusDto): Promise<JobApplication> {
  const validStatuses = ['pending', 'reviewed', 'interview', 'accepted', 'rejected'];
  if (!validStatuses.includes(dto.status)) throw new BadRequestException('Statut invalide');
  
  // ✅ Préparer les données de mise à jour (TypeORM update() veut un objet simple)
  const updateData: Partial<JobApplication> = { status: dto.status };
  
  // ✅ Gérer scheduledAt : undefined si pas présent, pas null
  if (dto.scheduledAt) {
    updateData.scheduledAt = new Date(dto.scheduledAt);
  } else if (dto.status !== 'interview') {
    // Si on quitte le statut interview, on retire la date
    updateData.scheduledAt = undefined;
  }
  
  await this.appRepo.update(applicationId, updateData);
  
  const updated = await this.appRepo.findOne({ 
    where: { id: applicationId }, 
    relations: ['candidate', 'jobOffer']  // ← 'jobOffer' camelCase
  });
  if (!updated) throw new NotFoundException('Candidature non trouvée');
  
  return updated;
}
}