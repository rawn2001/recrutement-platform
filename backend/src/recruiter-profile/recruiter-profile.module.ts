import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecruiterProfile } from './recruiter-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecruiterProfile])],
  exports: [TypeOrmModule],
})
export class RecruiterProfileModule {}