// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/users.entity';
import { CandidateProfile } from '../../candidate-profile/candidate-profile.entity';
import { RecruiterProfile } from '../../recruiter-profile/recruiter-profile.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(CandidateProfile)
    private candidateRepo: Repository<CandidateProfile>,
    @InjectRepository(RecruiterProfile)
    private recruiterRepo: Repository<RecruiterProfile>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'SECRET_MIN_32_CHARS_12345678901234567890123456789012',
    });
  }

  async validate(payload: { sub: number }) {
    console.log('🔐 JwtStrategy: validate pour userId:', payload.sub);

    // 1. Charger l'utilisateur
    const user = await this.usersRepo.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    console.log('✅ Utilisateur trouvé:', user.email, 'role:', user.role);

    // 2. Données de base
    const userData: any = {
      id: user.id,
      email: user.email,
      role: user.role,
      photo_url: user.photo_url,
      social_provider: user.social_provider,
      email_verified: user.email_verified,
      phone: user.phone,
      city: user.city,
      country: user.country,
    };

    // 3. ✅ Ajouter first_name/last_name si présents
    if (user.first_name) userData.first_name = user.first_name;
    if (user.last_name) userData.last_name = user.last_name;

    // 4. ✅ CHARGER MANUELLEMENT le profil candidat
    if (user.role === 'candidat') {
      const candidateProfile = await this.candidateRepo.findOne({
        where: { user: { id: user.id } },
      });
      
      if (candidateProfile) {
        console.log('👤 Profil candidat trouvé:', candidateProfile.prenom, candidateProfile.nom);
        userData.prenom = candidateProfile.prenom;
        userData.nom = candidateProfile.nom;
        userData.profession = candidateProfile.profession;
        userData.niveau_etude = candidateProfile.niveau_etude;
        userData.genre = candidateProfile.genre;
        userData.date_naissance = candidateProfile.date_naissance;
      } else {
        console.warn('⚠️ Profil candidat NON trouvé pour userId:', user.id);
      }
    }

    // 5. ✅ CHARGER MANUELLEMENT le profil recruteur
    if (user.role === 'recruteur') {
      const recruiterProfile = await this.recruiterRepo.findOne({
        where: { user: { id: user.id } },
      });
      
      if (recruiterProfile) {
        console.log('🏢 Profil recruteur trouvé');
        userData.nom_societe = recruiterProfile.nom_societe;
        userData.domaine = recruiterProfile.domaine;
        userData.poste_rh = recruiterProfile.poste_rh;
        userData.date_creation_societe = recruiterProfile.date_creation_societe;
      }
    }

    console.log('📤 Données retournées:', JSON.stringify(userData, null, 2));
    return userData;
  }
}