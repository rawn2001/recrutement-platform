import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nom!: string;

  @Column()
  prenom!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  password?: string;

  @Column()
  role!: 'candidat' | 'recruteur';

  @Column({ nullable: true })
  social_provider?: 'google' | 'facebook' | 'linkedin';

  @CreateDateColumn()
  created_at!: Date;
}