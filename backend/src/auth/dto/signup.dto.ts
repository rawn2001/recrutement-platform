import { IsEmail, IsString, IsEnum, IsOptional, MinLength, IsBoolean } from 'class-validator';
export class SignupDto {
  role!: 'candidat' | 'recruteur';
  email!: string;
  password?: string;
  social_provider?: string;
  social_id?: string;
  phone?: string;
  phone_country?: string;
  country?: string;
  city?: string;
  verification_type?: string;
  nom?: string;
  prenom?: string;
  genre?: string;
  date_naissance?: string;
  profession?: string;
  niveau_etude?: string;
  nom_societe?: string;
  domaine?: string;
  poste_rh?: string;
  date_creation_societe?: string;
}