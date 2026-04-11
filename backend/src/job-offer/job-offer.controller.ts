// src/job-offer/job-offer.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { JobOfferService } from './job-offer.service';

@Controller('job-offers')
export class JobOfferController {
  constructor(private readonly jobOfferService: JobOfferService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('recruteur')
  async create(@Req() req: any, @Body() formData: any) {
    return this.jobOfferService.create(req.user.id, formData);
  }

  @Get()
  async findAll() {
    return this.jobOfferService.findAllActive();
  }

  @Get('my-offers')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('recruteur')
  async findMyOffers(@Req() req: any) {
    return this.jobOfferService.findByRecruiter(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobOfferService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('recruteur')
  async update(@Req() req: any, @Param('id') id: string, @Body() formData: any) {
    return this.jobOfferService.update(+id, req.user.id, formData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('recruteur')
  async deactivate(@Req() req: any, @Param('id') id: string) {
    await this.jobOfferService.deactivate(+id, req.user.id);
    return { message: 'Offre désactivée avec succès' };
  }
}