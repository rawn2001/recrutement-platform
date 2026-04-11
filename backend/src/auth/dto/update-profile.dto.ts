export class UpdateProfileDto {
  phone?: string;
  phone_country?: string;
  country?: string;
  city?: string;
  address?: string;
  // Candidat
  nom?: string;
  prenom?: string;
  profession?: string;
  niveau_etude?: string;
  date_naissance?: string;
  genre?: string;
  // Recruteur
  nom_societe?: string;
  domaine?: string;
  poste_rh?: string;
  date_creation_societe?: string;
}