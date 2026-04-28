// backend/src/job-application/dto/update-application-status.dto.ts
import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsEnum(['pending', 'reviewed', 'interview', 'accepted', 'rejected'])
  status: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}