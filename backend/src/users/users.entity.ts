// src/users/users.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { CandidateProfile } from '../candidate-profile/candidate-profile.entity';
import { RecruiterProfile } from '../recruiter-profile/recruiter-profile.entity';
import { JobOffer } from '../job-offer/job-offer.entity';
import { JobApplication } from '../job-application/job-application.entity';
import { Expose } from 'class-transformer'; 

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  social_id: string;

  @Column({ nullable: true })
  photo_url: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  phone_country: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ default: false })
  phone_verified: boolean;

  // ✅ CORRECTION: type: 'varchar' force PostgreSQL à utiliser une chaîne
  @Column({ type: 'varchar', nullable: true })
  verification_code: string | null;

  @Column({ type: 'varchar', nullable: true })
  verification_type: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verification_code_expires: Date | null;

  @Column({ nullable: true })
  role: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ nullable: true })
  social_provider: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @OneToOne(() => CandidateProfile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  candidatProfile?: CandidateProfile;

// Dans la classe User - relation recruteurProfile :

@OneToOne(() => RecruiterProfile, (profile) => profile.user, { cascade: true })
// ❌ SUPPRIME @JoinColumn() d'ici ! C'est côté RecruiterProfile qu'il doit être
recruteurProfile?: RecruiterProfile;

  @OneToMany(() => JobOffer, (offer) => offer.recruiter)
  postedOffers?: JobOffer[];

  @OneToMany(() => JobApplication, (app) => app.candidate)
  applications?: JobApplication[];
}