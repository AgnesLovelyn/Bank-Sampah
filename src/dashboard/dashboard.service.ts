import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private async getNasabahIdByUserId(userId: string): Promise<string> {
    const nasabah = await this.prisma.nasabah.findUnique({ where: { userId } });
    if (!nasabah) {
      throw new NotFoundException('Data nasabah untuk user ini tidak ditemukan.');
    }
    return nasabah.id;
  }

  async summary(userId: string) {
    const nasabahId = await this.getNasabahIdByUserId(userId);

    const nasabah = await this.prisma.nasabah.findUnique({ where: { id: nasabahId } });

    const setorSelesai = await this.prisma.setorSampah.aggregate({
      where: { nasabahId, status: 'selesai' },
      _sum: { totalBeratKg: true, totalPoin: true },
    });

    const penukaranAgg = await this.prisma.penukaranPoin.aggregate({
      where: { nasabahId },
      _sum: { poinTerpakai: true },
    });

    const transaksiTerakhirSetor = await this.prisma.setorSampah.findFirst({
      where: { nasabahId },
      orderBy: { tanggal: 'desc' },
    });

    const transaksiTerakhirTukar = await this.prisma.penukaranPoin.findFirst({
      where: { nasabahId },
      orderBy: { tanggal: 'desc' },
      include: { hadiah: { select: { namaHadiah: true } } },
    });

    return {
      saldoPoinSaatIni: nasabah!.saldoPoin,
      totalSampahDisetorKg: setorSelesai._sum.totalBeratKg ?? 0,
      totalPoinDidapat: setorSelesai._sum.totalPoin ?? 0,
      totalPoinDitukar: penukaranAgg._sum.poinTerpakai ?? 0,
      transaksiTerakhirSetor: transaksiTerakhirSetor
        ? {
            kodeSetor: transaksiTerakhirSetor.kodeSetor,
            tanggal: transaksiTerakhirSetor.tanggal,
            beratKg: transaksiTerakhirSetor.totalBeratKg,
            poin: transaksiTerakhirSetor.totalPoin,
            status: transaksiTerakhirSetor.status,
          }
        : null,
      transaksiTerakhirTukar: transaksiTerakhirTukar
        ? {
            kodePenukaran: transaksiTerakhirTukar.kodePenukaran,
            tanggal: transaksiTerakhirTukar.tanggal,
            hadiah: transaksiTerakhirTukar.hadiah.namaHadiah,
            poin: transaksiTerakhirTukar.poinTerpakai,
            status: transaksiTerakhirTukar.status,
          }
        : null,
    };
  }

  async stats() {
    const [totalNasabah, totalKategoriSampah, totalTransaksiSetor, totalHadiah, setorAgg] =
      await Promise.all([
        this.prisma.nasabah.count(),
        this.prisma.kategoriSampah.count(),
        this.prisma.setorSampah.count(),
        this.prisma.hadiah.count(),
        this.prisma.setorSampah.aggregate({
          where: { status: 'selesai' },
          _sum: { totalBeratKg: true, totalPoin: true },
        }),
      ]);

    return {
      totalNasabah,
      totalKategoriSampah,
      totalTransaksiSetor,
      totalHadiah,
      totalBeratSampahKg: setorAgg._sum.totalBeratKg ?? 0,
      totalPoinTersalurkan: setorAgg._sum.totalPoin ?? 0,
    };
  }
}