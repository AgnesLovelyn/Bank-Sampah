import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles('NASABAH')
  summary(@Req() req: any) {
    return this.dashboardService.summary(req.user.sub);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  stats() {
    return this.dashboardService.stats();
  }
}