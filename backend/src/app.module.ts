// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CandidateProfileModule } from './candidate-profile/candidate-profile.module';
import { RecruiterProfileModule } from './recruiter-profile/recruiter-profile.module';
import { MailerConfigModule } from './mailer/mailer.module';  // ✅ Nouveau module
import { User } from './users/users.entity';
import { CandidateProfile } from './candidate-profile/candidate-profile.entity';
import { RecruiterProfile } from './recruiter-profile/recruiter-profile.entity';

@Module({
  imports: [
    // ✅ ConfigModule GLOBAL
    ConfigModule.forRoot({ 
      isGlobal: true, 
      envFilePath: '.env' 
    }),

    // ✅ MailerConfigModule (déjà global grâce à @Global())
    MailerConfigModule,

    // ✅ TypeORM
    // Dans src/app.module.ts, trouve TypeOrmModule.forRoot et remplace par :

TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User, CandidateProfile, RecruiterProfile],
  synchronize: true,
  
  // ✅ CONFIGURATION SSL POUR RENDER
  ssl: {
    rejectUnauthorized: false,  // ✅ Accepter le certificat auto-signé de Render
  },
  
  // ✅ Options supplémentaires pour stabilité
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
}),

    // ✅ Modules de l'application
    AuthModule,
    UsersModule,
    CandidateProfileModule,
    RecruiterProfileModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}