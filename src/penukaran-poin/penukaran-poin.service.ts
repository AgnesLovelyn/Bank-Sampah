import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePenukaranPoinDto } from './dto/create-penukaran-poin.dto';
import { StatusPenukaranEnum, UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto';

@Injectable()
export class PenukaranPoinService {
  constructor(private prisma: PrismaService) {}

  private async getNasabahIdByUserId(userId: string): Promise<string> {
    const nasabah = await this.prisma.nasabah.findUnique({ where: { userId } });
    if (!nasabah) {
      throw new NotFoundException('Data nasabah untuk user ini tidak ditemukan.');
    }
    return nasabah.id;
  }

  async tukar(userId: string, dto: CreatePenukaranPoinDto) {
    const nasabahId = await this.getNasabahIdByUserId(userId);

    const hadiah = await this.prisma.hadiah.findUnique({
      where: { id: dto.hadiahId },
    });
    if (!hadiah) {
      throw new NotFoundException('Data hadiah tidak ditemukan.');
    }

    if (hadiah.stok < 1) {
      throw new BadRequestException('Stok hadiah tidak mencukupi.');
    }

    const nasabah = await this.prisma.nasabah.findUnique({
      where: { id: nasabahId },
    });

    if (nasabah!.saldoPoin < hadiah.poinDibutuhkan) {
      throw new BadRequestException(
        `Saldo poin Anda (${nasabah!.saldoPoin} poin) tidak mencukupi untuk menukar hadiah ini (${hadiah.poinDibutuhkan} poin).`,
      );
    }

    const kodePenukaran = `TKR-${this.formatBulan(new Date())}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Transaction: kurangi saldoPoin nasabah, kurangi stok hadiah, buat record penukaran — semua atomic
    return this.prisma.$transaction(async (tx) => {
      await tx.nasabah.update({
        where: { id: nasabahId },
        data: { saldoPoin: { decrement: hadiah.poinDibutuhkan } },
      });

      await tx.hadiah.update({
        where: { id: hadiah.id },
        data: { stok: { decrement: 1 } },
      });

      return tx.penukaranPoin.create({
        data: {
          kodePenukaran,
          nasabahId,
          hadiahId: hadiah.id,
          poinTerpakai: hadiah.poinDibutuhkan,
          status: 'diproses',
        },
        include: { hadiah: true },
      });
    });
  }

  async myList(userId: string) {
    const nasabahId = await this.getNasabahIdByUserId(userId);

    return this.prisma.penukaranPoin.findMany({
      where: { nasabahId },
      include: { hadiah: true },
      orderBy: { tanggal: 'desc' },
    });
  }

 async adminList(bulan?: string) {
  if (bulan && !/^\d{4}-\d{2}$/.test(bulan)) {
    throw new BadRequestException('Parameter bulan harus berformat YYYY-MM (contoh: 2026-09).');
  }

  return this.prisma.penukaranPoin.findMany({
    where: bulan ? this.filterBulan(bulan) : undefined,
    include: {
      nasabah: { select: { namaNasabah: true, telp: true } },
      hadiah: { select: { namaHadiah: true } },
    },
    orderBy: { tanggal: 'desc' },
  });
}

  async updateStatus(id: string, dto: UpdateStatusPenukaranDto) {
    const penukaran = await this.prisma.penukaranPoin.findUnique({ where: { id } });
    if (!penukaran) {
      throw new NotFoundException('Data penukaran poin tidak ditemukan.');
    }

    return this.prisma.penukaranPoin.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async getNota(id: string, requesterUserId: string, requesterRole: string) {
    const penukaran = await this.prisma.penukaranPoin.findUnique({
      where: { id },
      include: { nasabah: true, hadiah: true },
    });

    if (!penukaran) {
      throw new NotFoundException('Data penukaran poin tidak ditemukan.');
    }

    if (requesterRole === 'NASABAH' && penukaran.nasabah.userId !== requesterUserId) {
      throw new ForbiddenException('Anda tidak berhak mengakses data ini.');
    }

    return penukaran;
  }

  private formatBulan(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
  }

  private filterBulan(bulan: string) {
    const [year, month] = bulan.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return { tanggal: { gte: start, lt: end } };
  }
}