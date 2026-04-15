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
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
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
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.usersService.requestPasswordReset(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
    return this.usersService.verifyResetCodeAndChangePassword(
      verifyResetCodeDto.email,
      verifyResetCodeDto.code,
      verifyResetCodeDto.newPassword,
      verifyResetCodeDto.confirmNewPassword
    );
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
  console.log('🔵 Résultat handleSocialLogin:', {
    isNew: result.isNew,
    hasToken: !!result.token,
    redirect: result.redirect
  });
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  console.log('🔵 Frontend URL:', frontendUrl);
  
  if (result.isNew) {
    const redirectUrl = `${frontendUrl}${result.redirect}`;
    console.log('🔵 Redirect vers complete-profile:', redirectUrl);
    return res.redirect(redirectUrl);
  } else {
    const redirectUrl = `${frontendUrl}/dashboard?token=${result.token}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
    console.log('🔵 Redirect vers dashboard (URL complète):', redirectUrl.substring(0, 100) + '...');
    return res.redirect(redirectUrl);
  }
}

  // ═══════════════════════════════════════════════════
  // 🔷 LinkedIn OAuth
  // ═══════════════════════════════════════════════════

  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  linkedinAuth() {
    console.log('LinkedIn OAuth initié');
  }

  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinCallback(@Req() req: any, @Res() res: Response) {
    console.log('🔵 LINKEDIN CALLBACK - User:', req.user);
    
    const result = await this.authService.handleSocialLogin(req.user, 'linkedin');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    if (result.isNew) {
      res.redirect(`${frontendUrl}${result.redirect}`);
    } else {
      res.redirect(`${frontendUrl}/dashboard?token=${result.token}&user=${encodeURIComponent(JSON.stringify(result.user))}`);
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