import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { CreateHadiahDto } from './dto/create-hadiah.dto';
import { UpdateHadiahDto } from './dto/update-hadiah.dto';

@Injectable()
export class HadiahService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll() {
    return this.prisma.hadiah.findMany();
  }

  async findOne(id: string) {
    const hadiah = await this.prisma.hadiah.findUnique({ where: { id } });
    if (!hadiah) {
      throw new NotFoundException('Data hadiah tidak ditemukan.');
    }
    return hadiah;
  }

  async create(dto: CreateHadiahDto, file?: Express.Multer.File) {
    const existing = await this.prisma.hadiah.findUnique({
      where: { namaHadiah: dto.namaHadiah },
    });
    if (existing) {
      throw new ConflictException('Nama hadiah sudah ada.');
    }

    let fotoUrl: string | undefined;
    if (file) {
      fotoUrl = await this.cloudinaryService.uploadImage(file, 'hadiah');
    }

    return this.prisma.hadiah.create({
      data: { ...dto, foto: fotoUrl },
    });
  }

  async update(id: string, dto: UpdateHadiahDto, file?: Express.Multer.File) {
    await this.findOne(id);

    if (dto.namaHadiah) {
      const duplikat = await this.prisma.hadiah.findFirst({
        where: { namaHadiah: dto.namaHadiah, NOT: { id } },
      });
      if (duplikat) {
        throw new ConflictException('Nama hadiah sudah dipakai hadiah lain.');
      }
    }

    let fotoUrl: string | undefined;
    if (file) {
      fotoUrl = await this.cloudinaryService.uploadImage(file, 'hadiah');
    }

    return this.prisma.hadiah.update({
      where: { id },
      data: { ...dto, ...(fotoUrl && { foto: fotoUrl }) },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.hadiah.delete({ where: { id } });
    return { id };
  }
}