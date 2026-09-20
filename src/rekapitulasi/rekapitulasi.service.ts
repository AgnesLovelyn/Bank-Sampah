import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RekapitulasiService {
  constructor(private prisma: PrismaService) {}

  async bulanan(bulan?: string) {
    if (!bulan || !/^\d{4}-\d{2}$/.test(bulan)) {
      throw new BadRequestException('Parameter bulan wajib diisi dengan format YYYY-MM.');
    }

    const { start, end } = this.parseBulan(bulan);

    // Ambil detail setor yang statusnya sudah "selesai" dalam bulan tsb
    const details = await this.prisma.detailSetor.findMany({
      where: { setor: { tanggal: { gte: start, lt: end }, status: 'selesai' } },
      include: { kategoriSampah: true },
    });

    const breakdown: Record<string, { tonaseKg: number; rupiah: number; poin: number }> = {
      plastik: { tonaseKg: 0, rupiah: 0, poin: 0 },
      kertas: { tonaseKg: 0, rupiah: 0, poin: 0 },
      logam: { tonaseKg: 0, rupiah: 0, poin: 0 },
      kaca: { tonaseKg: 0, rupiah: 0, poin: 0 },
    };

    let totalKg = 0;
    let totalRupiah = 0;
    let totalPoin = 0;

    for (const d of details) {
      const jenis = d.kategoriSampah.jenis;
      const rupiah = Math.round(d.beratKg * d.kategoriSampah.hargaPerKg);

      breakdown[jenis].tonaseKg += d.beratKg;
      breakdown[jenis].rupiah += rupiah;
      breakdown[jenis].poin += d.subtotalPoin;

      totalKg += d.beratKg;
      totalRupiah += rupiah;
      totalPoin += d.subtotalPoin;
    }

    const penukaran = await this.prisma.penukaranPoin.aggregate({
      where: { tanggal: { gte: start, lt: end } },
      _count: { _all: true },
      _sum: { poinTerpakai: true },
    });

    return {
      periode: bulan,
      rekapitulasiTonase: {
        totalKg,
        totalTon: totalKg / 1000,
        totalEstimasiPembayaranRupiah: totalRupiah,
        totalPoinDiterbitkan: totalPoin,
      },
      breakdownJenisSampah: breakdown,
      rekapitulasiPenukaranPoin: {
        totalTransaksiPenukaran: penukaran._count._all,
        totalPoinTerpakai: penukaran._sum.poinTerpakai ?? 0,
      },
    };
  }

  private parseBulan(bulan: string) {
    const [year, month] = bulan.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return { start, end };
  }
}