import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { PenukaranPoinService } from './penukaran-poin.service';
import { CreatePenukaranPoinDto } from './dto/create-penukaran-poin.dto';
import { UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('penukaran-poin')
@UseGuards(JwtAuthGuard)
export class PenukaranPoinController {
  constructor(private penukaranPoinService: PenukaranPoinService) {}

  @Post('tukar')
  @UseGuards(RolesGuard)
  @Roles('NASABAH')
  tukar(@Req() req: any, @Body() dto: CreatePenukaranPoinDto) {
    return this.penukaranPoinService.tukar(req.user.sub, dto);
  }

  @Get('my-penukaran')
  @UseGuards(RolesGuard)
  @Roles('NASABAH')
  myList(@Req() req: any) {
    return this.penukaranPoinService.myList(req.user.sub);
  }

  @Get('admin/list')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminList(@Query('bulan') bulan?: string) {
    return this.penukaranPoinService.adminList(bulan);
  }

  @Put('admin/status/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusPenukaranDto) {
    return this.penukaranPoinService.updateStatus(id, dto);
  }

  @Get('nota/:id')
  getNota(@Req() req: any, @Param('id') id: string) {
    return this.penukaranPoinService.getNota(id, req.user.sub, req.user.role);
  }
}