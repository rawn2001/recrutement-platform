// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CandidateProfileModule } from './candidate-profile/candidate-profile.module';
import { RecruiterProfileModule } from './recruiter-profile/recruiter-profile.module';
import { MailerConfigModule } from './mailer/mailer.module';
import { JobOfferModule } from './job-offer/job-offer.module';
import { JobApplicationModule } from './job-application/job-application.module';

import { User } from './users/users.entity';
import { CandidateProfile } from './candidate-profile/candidate-profile.entity';
import { RecruiterProfile } from './recruiter-profile/recruiter-profile.entity';
import { JobOffer } from './job-offer/job-offer.entity';
import { JobApplication } from './job-application/job-application.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MailerConfigModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User, CandidateProfile, RecruiterProfile, JobOffer, JobApplication],
      synchronize: true,
      ssl: { rejectUnauthorized: false },
      extra: { ssl: { rejectUnauthorized: false } },
    }),
    AuthModule,
    UsersModule,
    CandidateProfileModule,
    RecruiterProfileModule,
    JobOfferModule,
    JobApplicationModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}