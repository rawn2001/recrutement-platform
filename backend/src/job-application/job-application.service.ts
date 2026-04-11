// src/job-application/job-application.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobApplication } from './job-application.entity';
import { JobOffer } from '../job-offer/job-offer.entity';

@Injectable()
export class JobApplicationService {
  constructor(
    @InjectRepository(JobApplication)
    private appRepo: Repository<JobApplication>,
    @InjectRepository(JobOffer)
    private jobOfferRepo: Repository<JobOffer>,
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

  async apply(candidateId: number, jobOfferId: number, formData: any, cvText?: string): Promise<JobApplication> {
    const jobOffer = await this.jobOfferRepo.findOne({ where: { id: jobOfferId, is_active: true } });
    if (!jobOffer) throw new NotFoundException('Offre non trouvée ou inactive');

    const matchingScore = this.calculateMatchingScore(
      cvText || '',
      formData.required_skills || jobOffer.required_skills || []
    );

    const application = this.appRepo.create({
      candidate_id: candidateId,
      job_offer_id: jobOfferId,
      cv_url: formData.cv_url,
      cv_filename: formData.cv_filename,
      cover_letter: formData.cover_letter,
      matching_score: matchingScore,
      matching_details: JSON.stringify({ skills_match: matchingScore, method: 'keyword_simple' }),
      status: 'pending',
    });

    return this.appRepo.save(application);
  }

  async findByJobOffer(jobOfferId: number, recruiterId: number): Promise<JobApplication[]> {
    const offer = await this.jobOfferRepo.findOne({ where: { id: jobOfferId, recruiter_id: recruiterId } });
    if (!offer) throw new BadRequestException('Offre non trouvée ou accès refusé');
    return this.appRepo.find({ where: { job_offer_id: jobOfferId }, relations: ['candidate'], order: { applied_at: 'DESC' } });
  }

  async findByCandidate(candidateId: number): Promise<JobApplication[]> {
    return this.appRepo.find({ where: { candidate_id: candidateId }, relations: ['jobOffer'], order: { applied_at: 'DESC' } });
  }

  async updateStatus(applicationId: number, recruiterId: number, status: string): Promise<JobApplication> {
    const validStatuses = ['pending', 'reviewed', 'interview', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) throw new BadRequestException('Statut invalide');
    await this.appRepo.update(applicationId, { status });
    const updated = await this.appRepo.findOne({ where: { id: applicationId }, relations: ['candidate', 'jobOffer'] });
    if (!updated) throw new NotFoundException('Candidature non trouvée');
    return updated;
  }
}