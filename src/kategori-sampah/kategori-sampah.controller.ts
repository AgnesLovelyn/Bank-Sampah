import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KategoriSampahService } from './kategori-sampah.service';
import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';

@Controller('kategori-sampah')
export class KategoriSampahController {
  constructor(private kategoriSampahService: KategoriSampahService) {}

  // GET boleh diakses Nasabah & Admin — tanpa guard role, tapi tetap boleh dites tanpa login
  @Get()
  findAll() {
    return this.kategoriSampahService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kategoriSampahService.findOne(id);
  }

  // POST/PUT/DELETE khusus Admin
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      namaKategori: { type: 'string' },
      hargaPerKg: { type: 'number' },
      poinPerKg: { type: 'number' },
      jenis: { type: 'string', enum: ['plastik', 'kertas', 'logam', 'kaca'] },
      foto: { type: 'string', format: 'binary' },
    },
  },
})
  @UseInterceptors(FileInterceptor('foto'))
  create(
    @Body() dto: CreateKategoriSampahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.kategoriSampahService.create(dto, file);
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
      namaKategori: { type: 'string' },
      hargaPerKg: { type: 'number' },
      poinPerKg: { type: 'number' },
      jenis: { type: 'string', enum: ['plastik', 'kertas', 'logam', 'kaca'] },
      foto: { type: 'string', format: 'binary' },
    },
  },
})
  @UseInterceptors(FileInterceptor('foto'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateKategoriSampahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.kategoriSampahService.update(id, dto, file);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.kategoriSampahService.remove(id);
  }
}