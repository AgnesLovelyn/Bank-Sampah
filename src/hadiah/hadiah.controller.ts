import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HadiahService } from './hadiah.service';
import { CreateHadiahDto } from './dto/create-hadiah.dto';
import { UpdateHadiahDto } from './dto/update-hadiah.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';

@Controller('hadiah')
export class HadiahController {
  constructor(private hadiahService: HadiahService) {}

  @Get()
  findAll() {
    return this.hadiahService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hadiahService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      namaHadiah: { type: 'string' },
      poinDibutuhkan: { type: 'number' },
      stok: { type: 'number' },
      foto: { type: 'string', format: 'binary' },
    },
  },
})
  @UseInterceptors(FileInterceptor('foto'))
  create(
    @Body() dto: CreateHadiahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.hadiahService.create(dto, file);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      namaHadiah: { type: 'string' },
      poinDibutuhkan: { type: 'number' },
      stok: { type: 'number' },
      foto: { type: 'string', format: 'binary' },
    },
  },
}) 
  @UseInterceptors(FileInterceptor('foto'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHadiahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.hadiahService.update(id, dto, file);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.hadiahService.remove(id);
  }
}