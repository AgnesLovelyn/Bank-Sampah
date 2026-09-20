import {ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto';

@Injectable()
export class KategoriSampahService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll() {
    return this.prisma.kategoriSampah.findMany();
  }

  async findOne(id: string) {
    const kategori = await this.prisma.kategoriSampah.findUnique({
      where: { id },
    });
    if (!kategori) {
      throw new NotFoundException('Data kategori sampah tidak ditemukan.');
    }
    return kategori;
  }

  async create(dto: CreateKategoriSampahDto, file?: Express.Multer.File) {
    const existing = await this.prisma.kategoriSampah.findUnique({
      where: { namaKategori: dto.namaKategori },
    });
    if (existing) {
      throw new ConflictException('Nama kategori sampah sudah ada.');
    }

    let fotoUrl: string | undefined;
    if (file) {
      fotoUrl = await this.cloudinaryService.uploadImage(file, 'kategori-sampah');
    }

    return this.prisma.kategoriSampah.create({
      data: { ...dto, foto: fotoUrl },
    });
  }

  async update(id: string, dto: UpdateKategoriSampahDto, file?: Express.Multer.File) {
    await this.findOne(id); // 404 kalau id nggak ada

    if (dto.namaKategori) {
      const duplikat = await this.prisma.kategoriSampah.findFirst({
        where: { namaKategori: dto.namaKategori, NOT: { id } },
      });
      if (duplikat) {
        throw new ConflictException('Nama kategori sampah sudah dipakai kategori lain.');
      }
    }

    let fotoUrl: string | undefined;
    if (file) {
      fotoUrl = await this.cloudinaryService.uploadImage(file, 'kategori-sampah');
    }

    return this.prisma.kategoriSampah.update({
      where: { id },
      data: { ...dto, ...(fotoUrl && { foto: fotoUrl }) },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // 404 kalau id nggak ada
    await this.prisma.kategoriSampah.delete({ where: { id } });
    return { id };
  }
}