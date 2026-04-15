// src/mailer/mailer.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
// ✅ NOUVEL IMPORT (chemin public) :
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: Number(configService.get('MAIL_PORT')),
          secure: true,
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
        },
        defaults: {
          // ✅ SEULEMENT "from" - PAS de "to" ou "bcc" !
          from: `"TalentSphere" <${configService.get('MAIL_USER')}>`,
        },
        template: {
          dir: process.cwd() + '/templates',
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
        preview: false,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [MailerModule],
})
export class MailerConfigModule {}