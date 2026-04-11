import { Injectable ,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CandidateProfile } from '../candidate-profile/candidate-profile.entity';
import { RecruiterProfile } from '../recruiter-profile/recruiter-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(CandidateProfile) private candidatRepo: Repository<CandidateProfile>,
    @InjectRepository(RecruiterProfile) private recruteurRepo: Repository<RecruiterProfile>,
  ) {}

  create(data: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  // src/users/users.service.ts

// src/users/users.service.ts

// ✅ Méthode pour le LOGIN - charge le password
async findOneByEmailForLogin(email: string): Promise<User | null> {
  return this.usersRepo.findOne({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,        // ← ✅ Forcer le chargement du password
      role: true,
      social_provider: true,
      email_verified: true,
      phone: true,
      city: true,
      country: true,
      photo_url: true,
      first_name: true,
      last_name: true,
    },
  });
}

// ✅ Méthode normale - sans le password (pour sécurité)
findOneByEmail(email: string): Promise<User | null> {
  return this.usersRepo.findOne({ where: { email } });
}

  findOne(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id: id as any } });
  }

  update(id: number, data: Partial<User>) {
    return this.usersRepo.update(id, data);
  }

  async createCandidatProfile(user: User, data: any): Promise<CandidateProfile> {
    const profile = this.candidatRepo.create({ 
      user, 
      nom: data.nom, 
      prenom: data.prenom, 
      genre: data.genre, 
      date_naissance: data.date_naissance, 
      profession: data.profession, 
      niveau_etude: data.niveau_etude 
    });
    return this.candidatRepo.save(profile);
  }

  async createRecruteurProfile(user: User, data: any): Promise<RecruiterProfile> {
    const profile = this.recruteurRepo.create({ 
      user, 
      nom_societe: data.nom_societe, 
      domaine: data.domaine, 
      poste_rh: data.poste_rh, 
      date_creation_societe: data.date_creation_societe 
    });
    return this.recruteurRepo.save(profile);
  }

  async findOneBySocial(email: string, provider: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email, social_provider: provider } });
  }
  async updateProfile(userId: number, data: any) {
  const user = await this.usersRepo.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('Utilisateur non trouvé');

  // 1️⃣ Mettre à jour les champs utilisateur de base
  const userFields = ['phone', 'phone_country', 'country', 'city', 'address'];
  const userUpdate: any = {};
  userFields.forEach(f => { if (data[f] !== undefined) userUpdate[f] = data[f]; });
  if (Object.keys(userUpdate).length > 0) {
    await this.usersRepo.update(userId, userUpdate);
  }

  // 2️⃣ Mettre à jour le profil selon le rôle
  if (user.role === 'candidat') {
    const profile = await this.candidatRepo.findOne({ where: { user: { id: userId } } });
    if (profile) {
      const pFields = ['nom', 'prenom', 'profession', 'niveau_etude', 'date_naissance', 'genre'];
      const pUpdate: any = {};
      pFields.forEach(f => { if (data[f] !== undefined) pUpdate[f] = data[f]; });
      if (Object.keys(pUpdate).length > 0) {
        await this.candidatRepo.update(profile.id, pUpdate);
      }
    }
  } else if (user.role === 'recruteur') {
    const profile = await this.recruteurRepo.findOne({ where: { user: { id: userId } } });
    if (profile) {
      const pFields = ['nom_societe', 'domaine', 'poste_rh', 'date_creation_societe'];
      const pUpdate: any = {};
      pFields.forEach(f => { if (data[f] !== undefined) pUpdate[f] = data[f]; });
      if (Object.keys(pUpdate).length > 0) {
        await this.recruteurRepo.update(profile.id, pUpdate);
      }
    }
  }

  // 3️⃣ Retourner l'utilisateur mis à jour
  return this.usersRepo.findOne({
    where: { id: userId },
    relations: ['candidatProfile', 'recruteurProfile']
  });
}
}