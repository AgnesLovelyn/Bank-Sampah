import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeedService {
  constructor(private prisma: PrismaService) {}

  async run() {
    const existingAdmin = await this.prisma.user.findUnique({
      where: { username: 'admin_banksampah' },
    });
    if (existingAdmin) {
      throw new ConflictException(
        'Data seed sudah pernah dibuat sebelumnya. Hapus data lama dulu kalau mau seed ulang.',
      );
    }

    const hashedAdminPw = await bcrypt.hash('admin123', 10);
    const hashedNasabahPw = await bcrypt.hash('password123', 10);

    return this.prisma.$transaction(async (tx) => {
      // 1 Admin
      const adminUser = await tx.user.create({
        data: {
          username: 'admin_banksampah',
          password: hashedAdminPw,
          role: 'ADMIN',
          adminBank: {
            create: {
              namaUnit: 'Bank Sampah Asri Jaya',
              namaPengelola: 'Bapak H. Sukirman',
              telp: '081234567890',
            },
          },
        },
        include: { adminBank: true },
      });

      // 2 Nasabah
      const nasabah1User = await tx.user.create({
        data: {
          username: 'nasabah_budi',
          password: hashedNasabahPw,
          role: 'NASABAH',
          nasabah: {
            create: {
              namaNasabah: 'Budi Santoso',
              alamat: 'Jl. Merdeka No. 12, RT 03/05',
              telp: '085678901234',
              saldoPoin: 150,
            },
          },
        },
        include: { nasabah: true },
      });

      const nasabah2User = await tx.user.create({
        data: {
          username: 'nasabah_siti',
          password: hashedNasabahPw,
          role: 'NASABAH',
          nasabah: {
            create: {
              namaNasabah: 'Siti Aminah',
              alamat: 'Jl. Mawar Indah No. 45',
              telp: '081987654321',
              saldoPoin: 80,
            },
          },
        },
        include: { nasabah: true },
      });

      // 4 Kategori Sampah
      const kategoriData = [
        { namaKategori: 'Botol Plastik PET (Bersih)', hargaPerKg: 3500, poinPerKg: 10, jenis: 'plastik' as const },
        { namaKategori: 'Kardus & Karton Bekas', hargaPerKg: 2000, poinPerKg: 5, jenis: 'kertas' as const },
        { namaKategori: 'Kaleng Aluminium / Minuman', hargaPerKg: 12000, poinPerKg: 30, jenis: 'logam' as const },
        { namaKategori: 'Botol Kaca Bening', hargaPerKg: 1500, poinPerKg: 4, jenis: 'kaca' as const },
      ];
      const kategoriList = [];
      for (const k of kategoriData) {
        kategoriList.push(await tx.kategoriSampah.create({ data: k }));
      }

      // 3 Hadiah
      const hadiahData = [
        { namaHadiah: 'Voucher Pulsa / E-Wallet Rp 25.000', poinDibutuhkan: 75, stok: 50 },
        { namaHadiah: 'Minyak Goreng Bimoli 1 Liter', poinDibutuhkan: 100, stok: 25 },
        { namaHadiah: 'Beras Super Pulen 2.5 Kg', poinDibutuhkan: 180, stok: 15 },
      ];
      for (const h of hadiahData) {
        await tx.hadiah.create({ data: h });
      }

      // Riwayat setor sampah (1 transaksi selesai untuk nasabah_budi)
      const setor = await tx.setorSampah.create({
        data: {
          kodeSetor: 'STR-SEED-1001',
          tanggal: new Date(),
          status: 'selesai',
          totalBeratKg: 15,
          totalPoin: 150,
          catatan: 'Sampah sudah dipilah rapi dalam karung',
          catatanAdmin: 'Penimbangan selesai dan akurat.',
          nasabahId: nasabah1User.nasabah!.id,
          adminId: adminUser.adminBank!.id,
          detailSetors: {
            create: [
              { kategoriSampahId: kategoriList[0].id, beratKg: 10, subtotalPoin: 100 },
              { kategoriSampahId: kategoriList[1].id, beratKg: 5, subtotalPoin: 25 },
            ],
          },
        },
      });

      // Riwayat penukaran poin (1 transaksi selesai untuk nasabah_budi)
      const hadiahPertama = await tx.hadiah.findFirst({
        where: { namaHadiah: 'Voucher Pulsa / E-Wallet Rp 25.000' },
      });
      await tx.penukaranPoin.create({
        data: {
          kodePenukaran: 'TKR-SEED-5001',
          nasabahId: nasabah1User.nasabah!.id,
          hadiahId: hadiahPertama!.id,
          poinTerpakai: 75,
          status: 'selesai',
        },
      });

      return {
        admin: {
          username: 'admin_banksampah',
          password: 'admin123',
          namaUnit: 'Bank Sampah Asri Jaya',
        },
        nasabah1: {
          username: 'nasabah_budi',
          password: 'password123',
          namaNasabah: 'Budi Santoso',
          saldoPoin: 150,
        },
        nasabah2: {
          username: 'nasabah_siti',
          password: 'password123',
          namaNasabah: 'Siti Aminah',
          saldoPoin: 80,
        },
        kategoriSampahCount: kategoriList.length,
        hadiahKatalogCount: hadiahData.length,
      };
    });
  }
}