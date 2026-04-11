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
    // ✅ 1. Nettoyer application_deadline : convertir string → Date ou null
    let application_deadline: Date | null = null;
    if (formData.application_deadline) {
      // Si c'est une string (venant du frontend), la convertir
      if (typeof formData.application_deadline === 'string') {
        const date = new Date(formData.application_deadline);
        if (!isNaN(date.getTime())) {
          application_deadline = date;
        }
      } else if (formData.application_deadline instanceof Date) {
        application_deadline = formData.application_deadline;
      }
    }

    // ✅ 2. required_skills est déjà string[] | undefined dans Partial<JobOffer>
    // Pas besoin de .split() ici - c'est fait côté frontend
    const required_skills = formData.required_skills || [];

    // ✅ 3. Créer l'offre avec les champs nettoyés
    const offerData: Partial<JobOffer> = {
      ...formData,
      recruiter_id: recruiterId,
      application_deadline,
      required_skills,
    };

    // ✅ 4. Retirer les champs frontend-only qui ne sont pas dans l'entity
    delete (offerData as any).skillsInput;

    const offer = this.jobOfferRepo.create(offerData as JobOffer);
    return this.jobOfferRepo.save(offer);
  }

  async findAllActive(): Promise<JobOffer[]> {
    return this.jobOfferRepo.find({
      where: { is_active: true },
      relations: ['recruiter'],
      order: { created_at: 'DESC' }
    });
  }

  async findByRecruiter(recruiterId: number): Promise<JobOffer[]> {
    return this.jobOfferRepo.find({
      where: { recruiter_id: recruiterId },
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: number): Promise<JobOffer> {
    const offer = await this.jobOfferRepo.findOne({
      where: { id },
      relations: ['recruiter']
    });
    if (!offer) throw new NotFoundException('Offre non trouvée');
    return offer;
  }

  async update(id: number, recruiterId: number, formData: Partial<JobOffer>): Promise<JobOffer> {
    const offer = await this.findOne(id);
    if (offer.recruiter_id !== recruiterId) {
      throw new BadRequestException('Vous ne pouvez pas modifier cette offre');
    }
    
    // Même nettoyage pour update
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