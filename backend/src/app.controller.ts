// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // ✅ PAS de constructor - PAS de dépendance AppService

  @Get()
  getHello(): string {
    return '🚀 TalentSphere API is running!';
  }

  @Get('health')
  health(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}