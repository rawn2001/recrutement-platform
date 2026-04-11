// src/job-offer/job-offer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { JobApplication } from '../job-application/job-application.entity';

@Entity('job_offers')
export class JobOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array', { nullable: true })
  required_skills: string[];

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  salary_range: string;

  @Column({ nullable: true })
  employment_type: string;

  @Column({ nullable: true })
  experience_level: string;

  @Column({ default: true })
  is_active: boolean;

@Column({ 
  type: 'timestamp',  // ← Type SQL explicite pour PostgreSQL
  nullable: true,
  default: null
})
application_deadline: Date | null;

  @ManyToOne(() => User, user => user.postedOffers)
  @JoinColumn({ name: 'recruiter_id' })
  recruiter: User;

  @Column({ name: 'recruiter_id' })
  recruiter_id: number;

  @OneToMany(() => JobApplication, app => app.jobOffer)
  applications: JobApplication[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}