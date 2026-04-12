export class ChangePasswordDto {
  currentPassword: string;  // Mot de passe actuel (pour vérification)
  newPassword: string;      // Nouveau mot de passe
  confirmNewPassword: string; // Confirmation du nouveau mot de passe
}