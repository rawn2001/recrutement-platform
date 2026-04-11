// src/job-application/job-application.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { JobOffer } from '../job-offer/job-offer.entity';

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.applications)
  @JoinColumn({ name: 'candidate_id' })
  candidate: User;

  @Column({ name: 'candidate_id' })
  candidate_id: number;

  @ManyToOne(() => JobOffer, offer => offer.applications)
  @JoinColumn({ name: 'job_offer_id' })
  jobOffer: JobOffer;

  @Column({ name: 'job_offer_id' })
  job_offer_id: number;

  @Column({ nullable: true })
  cv_url: string;

  @Column({ nullable: true })
  cv_filename: string;

  @Column('text', { nullable: true })
  cover_letter: string;

  @Column({ type: 'float', nullable: true })
  matching_score: number;

  @Column({ nullable: true })
  matching_details: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  applied_at: Date;
}