export class ForgotPasswordDto {
  email: string;
}

export class VerifyResetCodeDto {
  email: string;
  code: string;
  newPassword: string;
  confirmNewPassword: string;
}