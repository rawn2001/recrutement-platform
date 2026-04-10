import { IsEmail, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  email!: string;
  password!: string;
}