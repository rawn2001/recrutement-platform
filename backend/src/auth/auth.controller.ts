import { Controller, Get, Post, Req, Res, UseGuards, Body, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    console.log('Google OAuth initié');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    console.log('GOOGLE CALLBACK APPELÉ');
    
    try {
      const result = await this.authService.handleSocialLogin(req.user, 'google');
      
      if (result.isNew) {
        return res.redirect('http://localhost:3001' + result.redirect);
      }
      
      return res.redirect('http://localhost:3001/dashboard?token=' + result.token);
      
    } catch (error: any) {
      console.error('ERREUR googleCallback:', error.message);
      return res.redirect('http://localhost:3001/login?error=oauth_failed');
    }
  }

  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  linkedinAuth() {
    console.log('LinkedIn OAuth initié');
  }

  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinCallback(@Req() req, @Res() res: Response) {
    console.log('LINKEDIN CALLBACK APPELÉ');
    
    try {
      const result = await this.authService.handleSocialLogin(req.user, 'linkedin');
      
      if (result.isNew) {
        return res.redirect('http://localhost:3001' + result.redirect);
      }
      
      return res.redirect('http://localhost:3001/dashboard?token=' + result.token);
      
    } catch (error: any) {
      console.error('ERREUR linkedinCallback:', error.message);
      return res.redirect('http://localhost:3001/login?error=oauth_failed');
    }
  }

  @Post('signup/social/complete')
  async completeSocial(@Body() data: any) {
    return this.authService.completeSocialProfile(data);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req) {
    return req.user;
  }
}