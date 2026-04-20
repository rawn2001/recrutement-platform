// backend/src/ml/ml.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MlService } from './ml.service';

@Module({
  imports: [
    // HttpModule permet de faire des requêtes HTTP vers Flask
    HttpModule.register({
      timeout: 1800000,  // ← ÉTAIT: 45000
      maxRedirects: 5,
    
     
    }),
  ],
  providers: [MlService],
  exports: [MlService], // Export pour utilisation dans d'autres modules
})
export class MlModule {}