// src/job-application/job-application.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplication } from './job-application.entity';
import { JobOffer } from '../job-offer/job-offer.entity';  // ✅ Importer JobOffer
import { JobApplicationService } from './job-application.service';
import { JobApplicationController } from './job-application.controller';

@Module({
  imports: [
    // ✅ Importer LES DEUX entities pour que les repositories soient disponibles
    TypeOrmModule.forFeature([JobApplication, JobOffer]),
  ],
  providers: [JobApplicationService],
  controllers: [JobApplicationController],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}