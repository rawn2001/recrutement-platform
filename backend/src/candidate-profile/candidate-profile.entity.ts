import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('candidate_profiles')
export class CandidateProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  nom!: string;

  @Column()
  prenom!: string;

  @Column({ nullable: true })
  genre?: string;

  @Column({ type: 'date', nullable: true })
  date_naissance?: string;

  @Column({ nullable: true })
  profession?: string;

  @Column({ nullable: true })
  niveau_etude?: string;

  @Column({ nullable: true })
  cv_url?: string;
}