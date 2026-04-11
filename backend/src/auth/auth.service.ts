// src/auth/auth.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private mailerService: MailerService,
  ) {}

  private async sendVerificationEmail(to: string, code: string) {
  await this.mailerService.sendMail({
    to,
    subject: '🔐 Votre code de vérification TalentSphere',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f5f7;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 10px;
    }
    .logo span {
      color: #ffd700;
    }
    .header-text {
      color: #ffffff;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .greeting {
      font-size: 20px;
      color: #1f2937;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .message {
      font-size: 16px;
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .code-container {
      background-color: #f9fafb;
      border: 2px dashed #667eea;
      border-radius: 8px;
      padding: 30px;
      margin: 30px 0;
    }
    .code {
      font-size: 48px;
      font-weight: bold;
      color: #667eea;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .code-label {
      font-size: 14px;
      color: #6b7280;
      margin-top: 10px;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      text-align: left;
      border-radius: 4px;
    }
    .warning-text {
      font-size: 14px;
      color: #856404;
      line-height: 1.5;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.6;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      margin-top: 20px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="logo">Talent<span>Sphere</span></div>
      <div class="header-text">La plateforme qui connecte les talents aux opportunités</div>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">👋 Bienvenue sur TalentSphere !</div>
      
      <div class="message">
        Merci de vous être inscrit(e) sur notre plateforme. Pour finaliser votre inscription et sécuriser votre compte, veuillez utiliser le code de vérification ci-dessous :
      </div>

      <!-- Code Box -->
      <div class="code-container">
        <div class="code">${code}</div>
        <div class="code-label">Ce code est valable 10 minutes</div>
      </div>

      <!-- Warning -->
      <div class="warning">
        <div class="warning-text">
          <strong>⚠️ Important :</strong><br>
          • Ne partagez jamais ce code avec quelqu'un d'autre<br>
          • Notre équipe ne vous demandera jamais ce code<br>
          • Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email
        </div>
      </div>

      <!-- CTA Button -->
      <a href="http://localhost:3001/verify" class="button">
        Vérifier mon compte
      </a>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        <strong>Besoin d'aide ?</strong><br>
        Notre équipe est disponible 24/7 pour vous accompagner.<br><br>
        
        © 2026 TalentSphere. Tous droits réservés.<br>
        <em>Propulsé par l'innovation, dédié à votre succès.</em>
      </div>
      
      <div class="social-links">
        <a href="#">📧 Contact</a> • 
        <a href="#">📱 Support</a> • 
        <a href="#">🔒 Confidentialité</a>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  });
}

  async signupWithEmail(data: any) {
    const existing = await this.usersService.findOneByEmail(data.email);
    if (existing) throw new BadRequestException('Email deja utilise');
    
    const hashed = await bcrypt.hash(data.password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const user = await this.usersService.create({
      email: data.email,
      password: hashed,
      role: data.role,
      phone: data.phone,
      phone_country: data.phone_country,
      country: data.country,
      city: data.city,
      email_verified: false,
      phone_verified: false,
      verification_code: code,
      verification_type: 'email',
       photo_url: data.photo_url || null,
    });

    if (data.role === 'candidat') {
      await this.usersService.createCandidatProfile(user, data);
    } else {
      await this.usersService.createRecruteurProfile(user, data);
    }

    await this.sendVerificationEmail(data.email, code);
    return { message: 'Inscription reussie', userId: user.id };
  }

  async handleSocialLogin(profile: any, provider: string) {
    console.log(`🔵 handleSocialLogin appelé pour ${provider}`);
    // ✅ AJOUTE CE LOG pour voir ce que le provider envoie
  console.log('🔵 Profile reçu du provider:', JSON.stringify({
    email: profile.email,
    picture: profile.picture,      // Google
    photo_url: profile.photo_url,  // LinkedIn
    photos: profile.photos,        // Format alternatif
    name: profile.name
  }, null, 2));
    const email = profile.email?.toLowerCase();
    if (!email) {
      console.error('🔴 Email non fourni par le provider');
      throw new BadRequestException('Email non fourni');
    }

    console.log('🔵 Recherche utilisateur avec email:', email, 'et provider:', provider);
    let user = await this.usersService.findOneBySocial(email, provider);
    
    if (user) {
      console.log('✅ UTILISATEUR EXISTANT trouvé:', user.id);
      return { 
        token: this.generateToken(user), 
        redirect: '/dashboard', 
        isNew: false 
      };
    }

    console.log('🔍 Vérifier si email existe avec un autre provider');
    const existingEmail = await this.usersService.findOneByEmail(email);
    if (existingEmail) {
      console.log('⚠️ Email déjà utilisé avec un autre provider');
      throw new BadRequestException(
        `Cet email est déjà utilisé. Connectez-vous avec ${existingEmail.social_provider || 'email'}.`
      );
    }

    console.log('🆕 CRÉATION NOUVEL UTILISATEUR');
    user = await this.usersService.create({
      email,
      social_provider: provider,
      social_id: profile.social_id,
      photo_url: profile.photo_url,
      email_verified: true,
      phone_verified: false,
      role: undefined,
      first_name: profile.firstName || null,
      last_name: profile.lastName || null,
    });

    console.log('✅ Utilisateur créé avec ID:', user.id);

    const secret = process.env.JWT_SECRET || 'SECRET_MIN_32_CHARS_12345678901234567890123456789012';
    
    const tempToken = jwt.sign(
      { 
        userId: user.id, 
        firstName: profile.firstName, 
        lastName: profile.lastName, 
        photo: profile.photo_url,
        provider 
      },
      secret,
      { expiresIn: '5m' }
    );

    console.log('✅ Token temporaire généré');
    console.log('🔵 Redirect vers complete-profile');

    return { 
      tempToken, 
      redirect: `/complete-profile?token=${tempToken}`, 
      isNew: true 
    };
  }

  async completeSocialProfile(data: any) {
    console.log('📝 completeSocialProfile appelé');
    
    const secret = process.env.JWT_SECRET || 'SECRET_MIN_32_CHARS_12345678901234567890123456789012';
    const decoded: any = jwt.verify(data.tempToken, secret);
    
    const user = await this.usersService.findOne(decoded.userId);
    if (!user) throw new BadRequestException('Session expiree');

    await this.usersService.update(user.id, {
      role: data.role,
      phone: data.phone,
      phone_country: data.phone_country,
      country: data.country,
      city: data.city,
    });

    if (data.role === 'candidat') {
      await this.usersService.createCandidatProfile(user, {
        nom: decoded.lastName || 'Utilisateur',
        prenom: decoded.firstName || 'Social',
        profession: data.profession,
        niveau_etude: data.niveau_etude,
        date_naissance: data.date_naissance,
        genre: data.genre || 'homme',
      });
    } else {
      await this.usersService.createRecruteurProfile(user, {
        nom_societe: data.nom_societe,
        domaine: data.domaine,
        poste_rh: data.poste_rh,
        date_creation_societe: data.date_creation_societe,
      });
    }

    console.log('✅ Profil complété, génération du token final');
    
    return { 
      token: this.generateToken(user), 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        photo_url: user.photo_url 
      } 
    };
  }

  // ✅ MÉTHODE login() - DOIT EXISTER ICI
  async login(email: string, password: string) {
    console.log('🔐 login() appelé pour email:', email);
    
    // ✅ Utiliser findOneByEmailForLogin pour charger le password
    const user = await this.usersService.findOneByEmailForLogin(email);
    
    if (!user) {
      console.error('❌ Email introuvable:', email);
      throw new BadRequestException('Email introuvable');
    }
    
    console.log('✅ Utilisateur trouvé, password présent:', !!user.password);
    
    if (!user.password) {
      console.warn('⚠️ Compte social détecté (pas de password)');
      throw new BadRequestException('Compte social — utilisez Google ou LinkedIn');
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.error('❌ Mot de passe incorrect');
      throw new BadRequestException('Mot de passe incorrect');
    }

    console.log('✅ Login réussi pour:', email);
    return { token: this.generateToken(user), user };
  }

  async verifyCode(userId: number, code: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new BadRequestException('Utilisateur introuvable');
    if (user.verification_code !== code) throw new BadRequestException('Code incorrect');

    await this.usersService.update(userId, { 
      verification_code: undefined,
      email_verified: true 
    });
    
    return { token: this.generateToken(user), user };
  }

  private generateToken(user: User): string {
    const secret = process.env.JWT_SECRET || 'SECRET_MIN_32_CHARS_12345678901234567890123456789012';
    return jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '7d' }
    );
  }
}