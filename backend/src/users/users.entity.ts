// src/users/users.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { CandidateProfile } from '../candidate-profile/candidate-profile.entity';
import { RecruiterProfile } from '../recruiter-profile/recruiter-profile.entity';

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

  @Column({ nullable: true })
  verification_code: string;

  @Column({ nullable: true })
  verification_type: string;

  @Column({ nullable: true })
  role: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false }) // ⚠️ Ne pas retourner le password par défaut
  password: string;

  @Column({ nullable: true })
  social_provider: string;

  // ✅ Champs pour les comptes sociaux (Google/LinkedIn)
  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  // ✅ Relations avec les profils
  @OneToOne(() => CandidateProfile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  candidatProfile?: CandidateProfile;

  @OneToOne(() => RecruiterProfile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  recruteurProfile?: RecruiterProfile;
}