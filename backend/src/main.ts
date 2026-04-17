// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';  // ← Ajoute Reflector ICI !
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  // ✅ Maintenant ça marche car Reflector est importé
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: false, 
    forbidNonWhitelisted: false,
    transform: true 
  }));
  
  // Middleware pour forcer UTF-8 (caractères spéciaux)
  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });
  
  await app.listen(3000);
  console.log('🚀 Backend prêt sur http://localhost:3000');
}
bootstrap();