import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RekapitulasiService } from './rekapitulasi.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('rekapitulasi')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RekapitulasiController {
  constructor(private rekapitulasiService: RekapitulasiService) {}

  @Get('bulanan')
  bulanan(@Query('bulan') bulan?: string) {
    return this.rekapitulasiService.bulanan(bulan);
  }
}