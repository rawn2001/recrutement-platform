import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/users.entity'; // ⚠️ ADAPTE LE CHEMIN

@Entity('quiz_sessions')
export class QuizSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  candidate_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'candidate_id' })
  candidate: User;

  @Column()
  job_offer_id: number;

  @Column('json')
  questions_snapshot: any[];

  @Column({ nullable: true })
  score: number;

  @Column({ default: 'pending' })
  status: string; // ← string, pas de union type pour éviter les soucis TS

  @CreateDateColumn()
  created_at: Date;
}