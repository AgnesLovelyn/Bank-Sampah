import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { CreateNasabahDto } from './dto/create-nasabah.dto';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';

@Injectable()
export class NasabahService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll() {
    return this.prisma.nasabah.findMany({
      include: { user: { select: { username: true, role: true } } },
    });
  }

  async findOne(id: string) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: { id },
      include: { user: { select: { username: true, role: true } } },
    });

    if (!nasabah) {
      throw new NotFoundException('Data nasabah tidak ditemukan.');
    }

    return nasabah;
  }

  async create(dto: CreateNasabahDto, file?: Express.Multer.File) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Username sudah digunakan.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    let fotoUrl: string | undefined;
    if (file) {
      fotoUrl = await this.cloudinaryService.uploadImage(file, 'nasabah');
    }

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        role: 'NASABAH',
        nasabah: {
          create: {
            namaNasabah: dto.namaNasabah,
            alamat: dto.alamat,
            telp: dto.telp,
            foto: fotoUrl,
          },
        },
      },
      include: { nasabah: true },
    });

    return user.nasabah;
  }

  async update(id: string, dto: UpdateNasabahDto, file?: Express.Multer.File) {
    await this.findOne(id); // sekalian validasi 404 kalau id nggak ada

    let fotoUrl: string | undefined;
    if (file) {
      fotoUrl = await this.cloudinaryService.uploadImage(file, 'nasabah');
    }

    return this.prisma.nasabah.update({
      where: { id },
      data: {
        namaNasabah: dto.namaLengkap,
        telp: dto.noTelepon,
        alamat: dto.alamat,
        ...(fotoUrl && { foto: fotoUrl }),
      },
    });
  }

  async remove(id: string) {
    const nasabah = await this.findOne(id); // 404 kalau nggak ada

    // hapus User induknya sekalian (relasi 1-1, cascade otomatis hapus Nasabah)
    await this.prisma.user.delete({ where: { id: nasabah.userId } });

    return { id };
  }
}