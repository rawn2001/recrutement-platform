// src/auth/auth.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Req, 
  Res, 
  UseGuards, 
  Body, 
  Param, 
  Put 
} from '@nestjs/common';
import { AuthGuard  } from '@nestjs/passport';
import { AuthService  } from './auth.service';
import { Response } from 'express';
import {  BadRequestException } from '@nestjs/common'; 
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto, VerifyResetCodeDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // ═══════════════════════════════════════════════════
  // 📧 Email/Password
  // ═══════════════════════════════════════════════════

  @Post('signup/email')
  async signupWithEmail(@Body() data: any) {
    return this.authService.signupWithEmail(data);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('verify/:userId')
  async verifyCode(@Param('userId') userId: string, @Body() body: { code: string }) {
    return this.authService.verifyCode(parseInt(userId), body.code);
  }

  // ═══════════════════════════════════════════════════
  // 🔐 Profil & Mot de passe
  // ═══════════════════════════════════════════════════

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req) {
    return req.user;
  }

  @Put('profile')
@UseGuards(AuthGuard('jwt'))
async updateProfile(@Req() req, @Body() data: any) {  // ← "any" au lieu du DTO !
  console.log('🔵 updateProfile controller reçu:', data);  // ← Log pour déboguer
  return this.usersService.updateProfile(req.user.id, data);
}

  @Put('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }

 @Post('forgot-password')
  async forgotPassword(@Body() body: Record<string, any>) {
    console.log('📧 [CONTROLLER] forgot-password body:', body);
    return this.usersService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: Record<string, any>) {
    console.log('🔐 [CONTROLLER] reset-password body:', body);
    console.log('🔐 [CONTROLLER] body.email:', body.email, '| type:', typeof body.email);
    console.log('🔐 [CONTROLLER] body.code:', body.code, '| type:', typeof body.code);
    
    return this.usersService.verifyResetCodeAndChangePassword(
      body.email,
      body.code,
      body.newPassword,
      body.confirmNewPassword
    );
  }
  // ✅ Nouvelle route pour vérifier le code (sans changer le mot de passe)
@Post('verify-reset-code')
async verifyResetCode(@Body() body: Record<string, any>) {
  console.log('🔐 [CONTROLLER] verify-reset-code body:', body);
  
  const user = await this.usersService.usersRepo.findOne({
    where: { email: body.email },
    select: ['id', 'email', 'verification_code', 'verification_code_expires', 'social_provider']
  });
  
  if (!user) throw new BadRequestException('Code invalide');
  if (user.social_provider && ['google', 'linkedin'].includes(user.social_provider.toLowerCase())) {
    throw new BadRequestException('Les comptes sociaux ne peuvent pas réinitialiser leur mot de passe');
  }
  if (user.verification_code !== body.code) {
    throw new BadRequestException('Code de vérification incorrect');
  }
  if (user.verification_code_expires && new Date() > user.verification_code_expires) {
    throw new BadRequestException('Code expiré. Demandez un nouveau code.');
  }
  
  return { message: 'Code valide' };
}

  // ═══════════════════════════════════════════════════
  // 🔵 Google OAuth
  // ═══════════════════════════════════════════════════

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    console.log('Google OAuth initié');
  }

@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleCallback(@Req() req: any, @Res() res: Response) {
  console.log('🔵 GOOGLE CALLBACK - User:', req.user);
  
  const result = await this.authService.handleSocialLogin(req.user, 'google');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  
  // ✅ Branch NEW USER : assertion explicite
  if (result.isNew) {
    const newResult = result as { isNew: true; tempToken: string; redirect: string };
    const redirectUrl = `${frontendUrl}${newResult.redirect}?tempToken=${newResult.tempToken}`;
    console.log('🔵 Redirect vers complete-profile');
    return res.redirect(redirectUrl);
  } 
  // ✅ Branch EXISTING USER : assertion explicite
  else {
    const existingResult = result as { isNew: false; token: string; redirect: string; user: any };
    const redirectUrl = `${frontendUrl}/dashboard?token=${existingResult.token}&user=${encodeURIComponent(JSON.stringify(existingResult.user))}`;
    console.log('🔵 Redirect vers dashboard');
    return res.redirect(redirectUrl);
  }
}

  // ═══════════════════════════════════════════════════
  // 🔷 LinkedIn OAuth
  // ═══════════════════════════════════════════════════

@Get('linkedin/callback')
@UseGuards(AuthGuard('linkedin'))
async linkedinCallback(@Req() req: any, @Res() res: Response) {
  console.log('🔵 LINKEDIN CALLBACK - User:', req.user);
  
  const result = await this.authService.handleSocialLogin(req.user, 'linkedin');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  
  // ✅ Même logique avec assertions
  if (result.isNew) {
    const newResult = result as { isNew: true; tempToken: string; redirect: string };
    const redirectUrl = `${frontendUrl}${newResult.redirect}?tempToken=${newResult.tempToken}`;
    return res.redirect(redirectUrl);
  } else {
    const existingResult = result as { isNew: false; token: string; redirect: string; user: any };
    const redirectUrl = `${frontendUrl}/dashboard?token=${existingResult.token}&user=${encodeURIComponent(JSON.stringify(existingResult.user))}`;
    return res.redirect(redirectUrl);
  }
}
  // ═══════════════════════════════════════════════════
  // 📝 Complétion profil social
  // ═══════════════════════════════════════════════════

  @Post('signup/social/complete')
  async completeSocial(@Body() data: any) {
    return this.authService.completeSocialProfile(data);
  }
}