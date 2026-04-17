// src/job-offer/job-offer.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOffer } from './job-offer.entity';

@Injectable()
export class JobOfferService {
  constructor(
    @InjectRepository(JobOffer)
    private jobOfferRepo: Repository<JobOffer>
  ) {}

  async create(recruiterId: number, formData: Partial<JobOffer>): Promise<JobOffer> {
    let application_deadline: Date | null = null;
    if (formData.application_deadline) {
      if (typeof formData.application_deadline === 'string') {
        const date = new Date(formData.application_deadline);
        if (!isNaN(date.getTime())) {
          application_deadline = date;
        }
      } else if (formData.application_deadline instanceof Date) {
        application_deadline = formData.application_deadline;
      }
    }

    const required_skills = formData.required_skills || [];

    const offerData: Partial<JobOffer> = {
      ...formData,
      recruiter_id: recruiterId,
      application_deadline,
      required_skills,
    };

    delete (offerData as any).skillsInput;

    const offer = this.jobOfferRepo.create(offerData as JobOffer);
    return this.jobOfferRepo.save(offer);
  }

  // ✅ MODIFIÉ : Utiliser createQueryBuilder pour charger les relations imbriquées
 async findAllActive(): Promise<JobOffer[]> {
  const offers = await this.jobOfferRepo
    .createQueryBuilder('offer')
    .leftJoinAndSelect('offer.recruiter', 'recruiter')
    .leftJoinAndSelect('recruiter.recruteurProfile', 'recruteurProfile')
    .where('offer.is_active = :isActive', { isActive: true })
    .orderBy('offer.created_at', 'DESC')
    .getMany();
  
  // 🔍 DEBUG : Voir ce qui est chargé
  console.log('📦 [BACKEND] Offres chargées:', offers.map(o => ({
    id: o.id,
    title: o.title,
    recruiterId: o.recruiter_id,
    recruiterEmail: o.recruiter?.email,
    hasProfile: !!o.recruiter?.recruteurProfile,
    nomSociete: o.recruiter?.recruteurProfile?.nom_societe,
    domaine: o.recruiter?.recruteurProfile?.domaine
  })));
  
  return offers;
}

  async findByRecruiter(recruiterId: number): Promise<JobOffer[]> {
    return this.jobOfferRepo.find({
      where: { recruiter_id: recruiterId },
      order: { created_at: 'DESC' }
    });
  }

  // ✅ MODIFIÉ : Utiliser createQueryBuilder ici aussi
  async findOne(id: number): Promise<JobOffer> {
    const offer = await this.jobOfferRepo
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.recruiter', 'recruiter')
      .leftJoinAndSelect('recruiter.recruteurProfile', 'recruteurProfile')
      .where('offer.id = :id', { id })
      .getOne();
    
    if (!offer) throw new NotFoundException('Offre non trouvée');
    return offer;
  }

  async update(id: number, recruiterId: number, formData: Partial<JobOffer>): Promise<JobOffer> {
    const offer = await this.findOne(id);
    if (offer.recruiter_id !== recruiterId) {
      throw new BadRequestException('Vous ne pouvez pas modifier cette offre');
    }
    
    if (formData.application_deadline) {
      if (typeof formData.application_deadline === 'string') {
        const date = new Date(formData.application_deadline);
        if (!isNaN(date.getTime())) {
          formData.application_deadline = date;
        }
      }
    }
    
    await this.jobOfferRepo.update(id, formData);
    return this.findOne(id);
  }

  async deactivate(id: number, recruiterId: number): Promise<void> {
    const offer = await this.findOne(id);
    if (offer.recruiter_id !== recruiterId) {
      throw new BadRequestException('Vous ne pouvez pas supprimer cette offre');
    }
    await this.jobOfferRepo.update(id, { is_active: false });
  }
}