import { IsString, IsEmail, IsOptional } from 'class-validator';
export class VerifyDto {
  code!: string;
}