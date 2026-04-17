// src/recruiter-profile/recruiter-profile.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';

@Entity('recruiter_profiles')
export class RecruiterProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nom_societe: string;

  @Column({ nullable: true })
  domaine: string;

  @Column({ nullable: true })
  poste_rh: string;

  @Column({ type: 'date', nullable: true })
  date_creation_societe: Date;

  @Column({ nullable: true })
  logo_url: string;

  // ✅ RELATION : C'EST ICI qu'on met @JoinColumn car user_id est DANS CETTE table
  @OneToOne(() => User, (user) => user.recruteurProfile)
  @JoinColumn({ name: 'user_id' })  // ← Colonne dans recruiter_profiles
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}