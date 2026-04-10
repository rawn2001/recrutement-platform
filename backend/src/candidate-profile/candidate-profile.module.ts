import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateProfile } from './candidate-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateProfile])],
  exports: [TypeOrmModule],
})
export class CandidateProfileModule {}