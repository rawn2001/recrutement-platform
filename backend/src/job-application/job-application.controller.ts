// src/job-application/job-application.controller.ts
import { Controller, Get, Post, Put, Body, Param, Req, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { JobApplicationService } from './job-application.service';

// ✅ Type simple pour le fichier uploadé (évite l'erreur Express.Multer)
type UploadedFileType = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  filename?: string;
  path?: string;
  buffer?: Buffer;
};

@Controller('job-applications')
export class JobApplicationController {
  constructor(private readonly appService: JobApplicationService) {}

  @Post('apply/:jobOfferId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('candidat')
  @UseInterceptors(FileInterceptor('cv'))
  async apply(
    @Req() req: any,
    @Param('jobOfferId') jobOfferId: string,
    @Body() formData: any,
    @UploadedFile() file?: UploadedFileType,  // ✅ Type personnalisé, pas Express.Multer.File
  ) {
    const candidateId = req.user.id;
    const applicationData = {
      ...formData,
      cv_url: file?.path || file?.filename || formData.cv_url,
      cv_filename: file?.originalname || formData.cv_filename,
    };
    return this.appService.apply(candidateId, +jobOfferId, applicationData, formData.cv_text);
  }

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
    return this.appService.updateStatus(+id, req.user.id, body.status);
  }
}