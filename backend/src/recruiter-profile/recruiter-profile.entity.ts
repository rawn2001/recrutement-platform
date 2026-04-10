import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('recruiter_profiles')
export class RecruiterProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  nom_societe!: string;

  @Column({ nullable: true })
  domaine?: string;

  @Column({ nullable: true })
  poste_rh?: string;

  @Column({ type: 'date', nullable: true })
  date_creation_societe?: string;

  @Column({ nullable: true })
  logo_url?: string;
}