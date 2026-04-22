// src/ml-advice/ml-advice.controller.ts
import { Controller, Post, Get, UploadedFile, UseInterceptors, UseGuards, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MlAdviceService } from './ml-advice.service';

@Controller('ml-advice')
export class MlAdviceController {
  constructor(private readonly mlService: MlAdviceService) {}

  @Get('health')
  health() {
    return this.mlService.healthCheck();
  }

  @Post('analyze')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('candidat')
  @UseInterceptors(FileInterceptor('cv', {
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new Error('Seuls PDF, DOCX et TXT sont acceptés'), false);
    },
  }))
  async getAdvice(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { job_title?: string; job_skills?: string; job_description?: string }  // ← ✅ Accepte ces champs
  ) {
    if (!file) throw new Error('Fichier CV requis');

    // ✅ Formatage des infos job pour Flask
    const jobText = body.job_title 
      ? `Poste: ${body.job_title}\nCompétences: ${body.job_skills}\nDescription: ${body.job_description}` 
      : '';

    const result = await this.mlService.analyzeCv(file.buffer, file.originalname, jobText);

    const conseils = this.formatAdvice(result.metier, result.manquants, result.total_skills, result.matched_skills);

    return {
      metier: result.metier,
      manquants: result.manquants,
      total_skills: result.total_skills,
      matched_skills: result.matched_skills,
      score_competences: result.total_skills > 0 
        ? Math.round((result.matched_skills / result.total_skills) * 100) 
        : 0,
      conseils,
    };
  }

  private formatAdvice(metier: string, manquants: string[], total: number, matched: number) {
    const pourcentage = total > 0 ? Math.round((matched / total) * 100) : 0;
    
    if (manquants.length === 0) {
      return `🎉 Excellent ! Votre profil correspond parfaitement à **${metier}**. Vous maîtrisez ${matched}/${total} compétences clés.`;
    }
    
    const skills = manquants.slice(0, 5).map(s => `**${s}**`).join(', ');
    const plus = manquants.length > 5 ? ` et ${manquants.length - 5} autre(s)` : '';
    
    return `🎯 Pour optimiser votre CV vers **${metier}**, ajoutez ou renforcez : ${skills}${plus}.\n\n💡 Conseil : Intégrez-les via des projets personnels, certifications ou contributions open-source. Votre score actuel : ${pourcentage}% de compétences maîtrisées.`;
  }
}