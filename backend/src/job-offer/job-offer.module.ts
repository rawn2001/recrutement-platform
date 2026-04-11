// src/job-offer/job-offer.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOffer } from './job-offer.entity';
import { JobOfferService } from './job-offer.service';
import { JobOfferController } from './job-offer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer])],
  providers: [JobOfferService],
  controllers: [JobOfferController],
  exports: [JobOfferService],
})
export class JobOfferModule {}