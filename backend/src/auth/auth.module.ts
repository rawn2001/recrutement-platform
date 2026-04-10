// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { CandidateProfileModule } from '../candidate-profile/candidate-profile.module';
import { RecruiterProfileModule } from '../recruiter-profile/recruiter-profile.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { LinkedInStrategy } from './strategies/linkedin.strategy';

@Module({
  imports: [
    UsersModule,
    CandidateProfileModule,
    RecruiterProfileModule,
    PassportModule,
    // ❌ Plus besoin d'importer MailerModule ici car MailerConfigModule est @Global()
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    LinkedInStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}