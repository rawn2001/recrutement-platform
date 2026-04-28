// src/job-application/job-application.controller.ts
import { Controller, Get, Post, Put, Body, Param, Req, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { JobApplicationService } from './job-application.service';
// chayma
// ✅ Par celui-ci :
import { memoryStorage } from 'multer';  // ← Pour garder le buffer en mémoire
import { extname } from 'path';
import { writeFileSync, mkdirSync } from 'fs';  // ← Pour sauvegarder sur disque après
import { join } from 'path';


// ✅ Type simple pour le fichier uploadé (évite l'erreur Express.Multer)
type UploadedFileType = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  filename?: string;
  path?: string;
  buffer?: Buffer;FileInterceptor
};

@Controller('job-applications')
export class JobApplicationController {
  constructor(private readonly appService: JobApplicationService) {}

  @Post('apply/:jobOfferId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('candidat')
  //chayma
 @UseInterceptors(FileInterceptor('cv', {
storage: memoryStorage(),
  
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Seuls les PDF sont acceptés'), false);
  },
}))//chayma
//j'ai modifié tous fonction async apply
 async apply(
  @Req() req: any,
  @Param('jobOfferId') jobOfferId: string,
  @Body() formData: any,
  @UploadedFile() file?: Express.Multer.File,
) {
  const candidateId = req.user.id;
   // 🔹 LOGS DE DEBUG (à ajouter temporairement)
  console.log('📦 [CONTROLLER] Fichier reçu:', {
    originalname: file?.originalname,
    mimetype: file?.mimetype,
    size: file?.size,
    hasBuffer: !!file?.buffer,
    bufferLength: file?.buffer?.length
  });
   // Sauvegarder le fichier sur disque APRÈS l'analyse ML (optionnel)
  let savedPath: string | undefined;
  if (file?.buffer && file?.originalname) {
    try {
      // Créer le dossier si n'existe pas
      mkdirSync('./uploads/cv', { recursive: true });
      // Générer un nom unique
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `cv-${uniqueSuffix}${extname(file.originalname)}`;
      savedPath = join('./uploads/cv', filename);
      // Écrire le buffer sur disque
      writeFileSync(savedPath, file.buffer);
      console.log('💾 Fichier sauvegardé:', savedPath);
    } catch (err) {
      console.error('❌ Erreur sauvegarde fichier:', err);
    }
  }
  
  // Préparer les données de la candidature
  const applicationData = {
    ...formData,
  //  cv_url: file?.path || file?.filename,      // Chemin du fichier sauvegardé
   // cv_filename: file?.originalname,            // Nom original du fichier
     cv_url: savedPath || file?.originalname,  // ← Utiliser le chemin sauvegardé
    cv_filename: file?.originalname,
  
  };

  // 🔹 PASSER LE BUFFER AU SERVICE pour l'analyse ML
  return this.appService.apply(
    candidateId, 
    +jobOfferId, 
    applicationData, 
    formData.cv_text,    // Texte extrait (optionnel, côté frontend)
    file?.buffer,        // ← Buffer du fichier pour Flask ML
    file?.originalname   // ← Nom du fichier pour logs
  );
}//j'ai modifié tous fonction async apply

  @Get('job-offer/:jobOfferId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('recruteur')
  async findByJobOffer(@Req() req: any, @Param('jobOfferId') id: string) {
    return this.appService.findByJobOffer(+id, req.user.id);
  }

  @Get('my-applications')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('candidat')
  async findMyApplications(@Req() req: any) {
    return this.appService.findByCandidate(req.user.id);
  }

  @Put(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('recruteur')
  async updateStatus(@Req() req: any, @Param('id') id: string, @Body() body: { status: string }) {
    return this.appService.updateStatus(+id, req.user.id, body); 
  }
}