import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSetorSampahDto } from './dto/create-setor-sampah.dto';
import { VerifySetorSampahDto } from './dto/verify-setor-sampah.dto';

@Injectable()
export class SetorSampahService {
  constructor(private prisma: PrismaService) {}

  // Helper: convert User.id (dari JWT) -> Nasabah.id
  private async getNasabahIdByUserId(userId: string): Promise<string> {
    const nasabah = await this.prisma.nasabah.findUnique({ where: { userId } });
    if (!nasabah) {
      throw new NotFoundException('Data nasabah untuk user ini tidak ditemukan.');
    }
    return nasabah.id;
  }

  // Helper: convert User.id (dari JWT) -> AdminBank.id
  private async getAdminIdByUserId(userId: string): Promise<string> {
    const admin = await this.prisma.adminBank.findUnique({ where: { userId } });
    if (!admin) {
      throw new NotFoundException('Data admin untuk user ini tidak ditemukan.');
    }
    return admin.id;
  }

  async pengajuan(userId: string, dto: CreateSetorSampahDto) {
    const nasabahId = await this.getNasabahIdByUserId(userId);

    const kategoriIds = dto.items.map((i) => i.kategoriSampahId);
    const kategoriList = await this.prisma.kategoriSampah.findMany({
      where: { id: { in: kategoriIds } },
    });

    if (kategoriList.length !== kategoriIds.length) {
      throw new NotFoundException('Salah satu kategori sampah tidak ditemukan.');
    }

    const kategoriMap = new Map(kategoriList.map((k) => [k.id, k]));

    let totalBeratKg = 0;
    let totalPoin = 0;
    const detailData = dto.items.map((item) => {
      const kategori = kategoriMap.get(item.kategoriSampahId)!;
      const subtotalPoin = Math.round(item.beratKg * kategori.poinPerKg);
      totalBeratKg += item.beratKg;
      totalPoin += subtotalPoin;
      return {
        kategoriSampahId: item.kategoriSampahId,
        beratKg: item.beratKg,
        subtotalPoin,
      };
    });

    const kodeSetor = `STR-${this.formatBulan(new Date())}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.setorSampah.create({
      data: {
        kodeSetor,
        tanggal: new Date(dto.tanggal),
        catatan: dto.catatan,
        totalBeratKg,
        totalPoin,
        nasabahId, 
        detailSetors: { create: detailData },
      },
      include: { detailSetors: true },
    });
  }

 async myList(userId: string, bulan?: string) {
  if (bulan && !/^\d{4}-\d{2}$/.test(bulan)) {
    throw new BadRequestException('Parameter bulan harus berformat YYYY-MM (contoh: 2026-09).');
  }

  const nasabahId = await this.getNasabahIdByUserId(userId);

  return this.prisma.setorSampah.findMany({
    where: {
      nasabahId,
      ...(bulan && this.filterBulan(bulan)),
    },
    include: { detailSetors: { include: { kategoriSampah: true } } },
    orderBy: { tanggal: 'desc' },
  });
}

async adminList(status?: string, bulan?: string) {
  if (bulan && !/^\d{4}-\d{2}$/.test(bulan)) {
    throw new BadRequestException('Parameter bulan harus berformat YYYY-MM (contoh: 2026-09).');
  }

  return this.prisma.setorSampah.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(bulan && this.filterBulan(bulan)),
    },
    include: {
      nasabah: { select: { namaNasabah: true, telp: true } },
    },
    orderBy: { tanggal: 'desc' },
  });
}

  async findOne(id: string, requesterUserId: string, requesterRole: string) {
    const setor = await this.prisma.setorSampah.findUnique({
      where: { id },
      include: {
        nasabah: true, 
        detailSetors: { include: { kategoriSampah: true } },
      },
    });

    if (!setor) {
      throw new NotFoundException('Data setor sampah tidak ditemukan.');
    }

   
    if (requesterRole === 'NASABAH' && setor.nasabah.userId !== requesterUserId) {
      throw new ForbiddenException('Anda tidak berhak mengakses data ini.');
    }

    return setor;
  }

  async verify(id: string, dto: VerifySetorSampahDto, adminUserId: string) {
    const adminId = await this.getAdminIdByUserId(adminUserId);

    const setor = await this.prisma.setorSampah.findUnique({
      where: { id },
      include: { detailSetors: true },
    });

    if (!setor) {
      throw new NotFoundException('Data setor sampah tidak ditemukan.');
    }

    if (setor.status === 'selesai' || setor.status === 'ditolak') {
      throw new BadRequestException(
        `Transaksi ini sudah berstatus "${setor.status}" dan tidak bisa diverifikasi ulang.`,
      );
    }

    let totalPoinFinal = setor.totalPoin;
    let totalBeratFinal = setor.totalBeratKg;

    if (dto.itemsReal && dto.itemsReal.length > 0) {
      const kategoriIds = dto.itemsReal.map((i) => i.kategoriSampahId);
      const kategoriList = await this.prisma.kategoriSampah.findMany({
        where: { id: { in: kategoriIds } },
      });
      const kategoriMap = new Map(kategoriList.map((k) => [k.id, k]));

      totalPoinFinal = 0;
      totalBeratFinal = 0;
      for (const itemReal of dto.itemsReal) {
        const kategori = kategoriMap.get(itemReal.kategoriSampahId);
        if (!kategori) {
          throw new NotFoundException(
            `Kategori sampah ${itemReal.kategoriSampahId} tidak ditemukan.`,
          );
        }
        totalPoinFinal += Math.round(itemReal.beratKgReal * kategori.poinPerKg);
        totalBeratFinal += itemReal.beratKgReal;
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.setorSampah.update({
        where: { id },
        data: {
          status: dto.status,
          catatanAdmin: dto.catatanAdmin,
          totalPoin: totalPoinFinal,
          totalBeratKg: totalBeratFinal,
          adminId, 
        },
      });

      if (dto.status === 'selesai') {
        await tx.nasabah.update({
          where: { id: setor.nasabahId },
          data: { saldoPoin: { increment: totalPoinFinal } },
        });
      }

      return updated;
    });
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