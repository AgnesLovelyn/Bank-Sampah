import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { SetorSampahService } from './setor-sampah.service';
import { CreateSetorSampahDto } from './dto/create-setor-sampah.dto';
import { VerifySetorSampahDto } from './dto/verify-setor-sampah.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('setor-sampah')
@UseGuards(JwtAuthGuard)
export class SetorSampahController {
  constructor(private setorSampahService: SetorSampahService) {}

  @Post('pengajuan')
  @UseGuards(RolesGuard)
  @Roles('NASABAH')
  pengajuan(@Req() req: any, @Body() dto: CreateSetorSampahDto) {
    return this.setorSampahService.pengajuan(req.user.sub, dto);
  }

  @Get('my-setor')
  @UseGuards(RolesGuard)
  @Roles('NASABAH')
  myList(@Req() req: any, @Query('bulan') bulan?: string) {
    return this.setorSampahService.myList(req.user.sub, bulan);
  }

  @Get('admin/list')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminList(@Query('status') status?: string, @Query('bulan') bulan?: string) {
    return this.setorSampahService.adminList(status, bulan);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.setorSampahService.findOne(id, req.user.sub, req.user.role);
  }

  @Put('admin/verify/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  verify(@Req() req: any, @Param('id') id: string, @Body() dto: VerifySetorSampahDto) {
    return this.setorSampahService.verify(id, dto, req.user.sub);
  }
}