// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  // ✅ ValidationPipe CONFIGURÉE CORRECTEMENT
  app.useGlobalPipes(new ValidationPipe({
    whitelist: false,           // ← NE PAS supprimer les champs inconnus
    forbidNonWhitelisted: false, // ← NE PAS rejeter les champs inconnus
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  
  await app.listen(3000);
}
bootstrap();