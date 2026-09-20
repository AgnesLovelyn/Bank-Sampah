import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NasabahService } from './nasabah.service';
import { CreateNasabahDto } from './dto/create-nasabah.dto';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('admin/nasabah')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class NasabahController {
  constructor(private nasabahService: NasabahService) {}

  @Get()
  findAll() {
    return this.nasabahService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nasabahService.findOne(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      username: { type: 'string' },
      password: { type: 'string' },
      namaNasabah: { type: 'string' },
      alamat: { type: 'string' },
      telp: { type: 'string' },
      foto: { type: 'string', format: 'binary' },
    },
  },
})
  @UseInterceptors(FileInterceptor('foto'))
  create(
    @Body() dto: CreateNasabahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.nasabahService.create(dto, file);
  }

  @Put(':id')
  @ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      namaLengkap: { type: 'string' },
      noTelepon: { type: 'string' },
      alamat: { type: 'string' },
      tanggalLahir: { type: 'string' },
      foto: { type: 'string', format: 'binary' },
    },
  },
})
  @UseInterceptors(FileInterceptor('foto'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNasabahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.nasabahService.update(id, dto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nasabahService.remove(id);
  }
}