// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Augmenter la limite de taille du corps des requêtes (pour uploads)
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // ✅ CORS pour frontend React
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  // ✅ Validation globale
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(3000);
  console.log('🚀 Backend prêt sur http://localhost:3000');
}
bootstrap();