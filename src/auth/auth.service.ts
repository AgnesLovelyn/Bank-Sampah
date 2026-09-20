import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { RegisterNasabahDto } from './dto/register-nasabah.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async registerNasabah(dto: RegisterNasabahDto, file?: Express.Multer.File) {
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

    const { password, ...result } = user;
    return result;
  }

  async registerAdmin(dto: RegisterAdminDto) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Username sudah digunakan.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        role: 'ADMIN',
        adminBank: {
          create: {
            namaUnit: dto.namaUnit,
            namaPengelola: dto.namaPengelola,
            telp: dto.telp,
          },
        },
      },
      include: { adminBank: true },
    });

    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: { nasabah: true, adminBank: true },
    });

    if (!user) {
      throw new UnauthorizedException('Username atau password salah.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username atau password salah.');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      nasabah: user.nasabah ?? null,
      adminBank: user.adminBank ?? null,
      token,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { nasabah: true, adminBank: true },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan.');
    }

    const { password, ...result } = user;
    return result;
  }
}