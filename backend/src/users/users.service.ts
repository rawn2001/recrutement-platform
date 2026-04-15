// src/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CandidateProfile } from '../candidate-profile/candidate-profile.entity';
import { RecruiterProfile } from '../recruiter-profile/recruiter-profile.entity';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(CandidateProfile) private candidatRepo: Repository<CandidateProfile>,
    @InjectRepository(RecruiterProfile) private recruteurRepo: Repository<RecruiterProfile>,
    private mailerService: MailerService,
  ) {}

  // ✅ create - PARAMÈTRE "data" BIEN DÉFINI
  create(data: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async findOneByEmailForLogin(email: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { email },
      select: {
        id: true, email: true, password: true, role: true, social_provider: true,
        email_verified: true, phone: true, city: true, country: true,
        photo_url: true, first_name: true, last_name: true,
      },
    });
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id: id as any } });
  }

  // ✅ update - PARAMÈTRE "data" BIEN DÉFINI
  update(id: number, data: Partial<User>) {
    return this.usersRepo.update(id, data);
  }

  // ✅ createCandidatProfile - PARAMÈTRE "data" BIEN DÉFINI
  async createCandidatProfile(user: User, data: any): Promise<CandidateProfile> {
    const profile = this.candidatRepo.create({ 
      user, 
      nom: data.nom, prenom: data.prenom, genre: data.genre, 
      date_naissance: data.date_naissance, profession: data.profession, 
      niveau_etude: data.niveau_etude 
    });
    return this.candidatRepo.save(profile);
  }

  // ✅ createRecruteurProfile - PARAMÈTRE "data" BIEN DÉFINI
  async createRecruteurProfile(user: User, data: any): Promise<RecruiterProfile> {
    const profile = this.recruteurRepo.create({ 
      user, 
      nom_societe: data.nom_societe, domaine: data.domaine, 
      poste_rh: data.poste_rh, date_creation_societe: data.date_creation_societe 
    });
    return this.recruteurRepo.save(profile);
  }

  async findOneBySocial(email: string, provider: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email, social_provider: provider } });
  }
  async updateProfile(userId: number, data: any) {
    console.log('🔵 updateProfile reçu:', data);
    
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const updateData: any = {};
    const allowedFields = ['phone', 'phone_country', 'country', 'city', 'address', 'photo_url'];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined && data[field] !== null) {
        updateData[field] = data[field];
      }
    }
    
    if (Object.keys(updateData).length > 0) {
      await this.usersRepo.update(userId, updateData);
      console.log('✅ Table users mise à jour:', updateData);
    }

    return this.usersRepo.findOne({
      where: { id: userId },
      relations: ['candidatProfile', 'recruteurProfile']
    });
  }

  // ✅ changePassword - PARAMÈTRE "data" BIEN DÉFINI
  async changePassword(userId: number, data: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ 
      where: { id: userId },
      select: ['id', 'email', 'password', 'social_provider']
    });
    
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (user.social_provider) {
      throw new BadRequestException('Les comptes sociaux ne peuvent pas changer de mot de passe.');
    }
    if (!user.password) {
      throw new BadRequestException('Aucun mot de passe défini pour ce compte.');
    }
    
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Mot de passe actuel incorrect.');
    if (data.newPassword.length < 6) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 6 caractères.');
    }
    if (data.newPassword !== data.confirmNewPassword) {
      throw new BadRequestException('Les nouveaux mots de passe ne correspondent pas.');
    }
    
    const hashed = await bcrypt.hash(data.newPassword, 10);
    await this.usersRepo.update(userId, { password: hashed });
    return { message: 'Mot de passe mis à jour avec succès.' };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) return { message: 'Si cet email existe, vous recevrez un code de vérification.' };

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    await this.usersRepo.update(user.id, {
      verification_code: resetCode,
      verification_type: 'password_reset',
      verification_code_expires: resetCodeExpires,
    });

    await this.sendResetCodeEmail(user.email, resetCode);
    return { message: 'Si cet email existe, vous recevrez un code de vérification.' };
  }

  async verifyResetCodeAndChangePassword(
    email: string, code: string, newPassword: string, confirmNewPassword: string
  ): Promise<{ message: string }> {
    const user = await this.usersRepo.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'verification_code', 'verification_code_expires', 'social_provider']
    });

    if (!user) throw new BadRequestException('Code invalide ou expiré');
    if (user.social_provider) {
      throw new BadRequestException('Les comptes sociaux ne peuvent pas changer de mot de passe.');
    }
    if (user.verification_code !== code) throw new BadRequestException('Code incorrect');
    if (user.verification_code_expires && new Date() > user.verification_code_expires) {
      throw new BadRequestException('Code expiré');
    }
    if (newPassword.length < 6) throw new BadRequestException('Mot de passe trop court');
    if (newPassword !== confirmNewPassword) throw new BadRequestException('Mots de passe différents');
    
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersRepo.update(user.id, {
      password: hashed,
      verification_code: null,
      verification_type: null,
      verification_code_expires: null,
    });

    return { message: 'Mot de passe mis à jour avec succès.' };
  }

  private async sendResetCodeEmail(to: string, code: string) {
    await this.mailerService.sendMail({
      to,
      subject: '🔐 Réinitialisation de mot de passe - TalentSphere',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">🔐 Réinitialisation</h2>
          <p>Votre code: <strong style="font-size: 24px; letter-spacing: 4px;">${code}</strong></p>
          <p style="color: #6b7280; font-size: 12px;">Expire dans 10 minutes</p>
        </div>
      `,
    });
  }
}