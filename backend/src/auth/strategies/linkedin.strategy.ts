import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor() {
    super({
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID: process.env.LINKEDIN_CLIENT_ID ?? 'dummy',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? 'dummy',
      callbackURL: process.env.LINKEDIN_CALLBACK_URL ?? 'http://localhost:3000/auth/linkedin/callback',
      scope: 'openid profile email',
    });
  }

  async validate(accessToken: string, refreshToken: string, params: any, profile: any, done: Function) {
    try {
      const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
      const userInfo = await response.json();
      
      done(null, {
        email: userInfo.email,
        social_id: userInfo.sub,
        social_provider: 'linkedin',
        photo_url: userInfo.picture,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
      });
    } catch (error) {
      done(error, null);
    }
  }
}