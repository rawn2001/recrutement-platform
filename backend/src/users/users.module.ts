// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { CandidateProfile } from '../candidate-profile/candidate-profile.entity';
import { RecruiterProfile } from '../recruiter-profile/recruiter-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, CandidateProfile, RecruiterProfile]), // ✅ Tous les entities
  ],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule], // ✅ Exporter TypeOrmModule pour les repositories
})
export class UsersModule {}