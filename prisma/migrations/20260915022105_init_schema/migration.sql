/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('NASABAH', 'ADMIN');

-- CreateEnum
CREATE TYPE "JenisSampah" AS ENUM ('plastik', 'kertas', 'logam', 'kaca');

-- CreateEnum
CREATE TYPE "StatusSetor" AS ENUM ('menunggu_konfirmasi', 'diverifikasi', 'ditolak', 'selesai');

-- CreateEnum
CREATE TYPE "StatusPenukaran" AS ENUM ('diproses', 'selesai');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nasabah" (
    "id" TEXT NOT NULL,
    "namaNasabah" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "telp" TEXT NOT NULL,
    "saldoPoin" INTEGER NOT NULL DEFAULT 0,
    "foto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "nasabah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_bank" (
    "id" TEXT NOT NULL,
    "namaUnit" TEXT NOT NULL,
    "namaPengelola" TEXT NOT NULL,
    "telp" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "admin_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_sampah" (
    "id" TEXT NOT NULL,
    "namaKategori" TEXT NOT NULL,
    "hargaPerKg" DOUBLE PRECISION NOT NULL,
    "poinPerKg" DOUBLE PRECISION NOT NULL,
    "jenis" "JenisSampah" NOT NULL,
    "foto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kategori_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setor_sampah" (
    "id" TEXT NOT NULL,
    "kodeSetor" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "status" "StatusSetor" NOT NULL DEFAULT 'menunggu_konfirmasi',
    "catatan" TEXT,
    "catatanAdmin" TEXT,
    "totalBeratKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPoin" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nasabahId" TEXT NOT NULL,
    "adminId" TEXT,

    CONSTRAINT "setor_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_setor" (
    "id" TEXT NOT NULL,
    "beratKg" DOUBLE PRECISION NOT NULL,
    "subtotalPoin" INTEGER NOT NULL DEFAULT 0,
    "setorId" TEXT NOT NULL,
    "kategoriSampahId" TEXT NOT NULL,

    CONSTRAINT "detail_setor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hadiah" (
    "id" TEXT NOT NULL,
    "namaHadiah" TEXT NOT NULL,
    "poinDibutuhkan" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL,
    "foto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hadiah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penukaran_poin" (
    "id" TEXT NOT NULL,
    "kodePenukaran" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "poinTerpakai" INTEGER NOT NULL,
    "status" "StatusPenukaran" NOT NULL DEFAULT 'diproses',
    "nasabahId" TEXT NOT NULL,
    "hadiahId" TEXT NOT NULL,

    CONSTRAINT "penukaran_poin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "nasabah_userId_key" ON "nasabah"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_bank_userId_key" ON "admin_bank"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_sampah_namaKategori_key" ON "kategori_sampah"("namaKategori");

-- CreateIndex
CREATE UNIQUE INDEX "setor_sampah_kodeSetor_key" ON "setor_sampah"("kodeSetor");

-- CreateIndex
CREATE UNIQUE INDEX "hadiah_namaHadiah_key" ON "hadiah"("namaHadiah");

-- CreateIndex
CREATE UNIQUE INDEX "penukaran_poin_kodePenukaran_key" ON "penukaran_poin"("kodePenukaran");

-- AddForeignKey
ALTER TABLE "nasabah" ADD CONSTRAINT "nasabah_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_bank" ADD CONSTRAINT "admin_bank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setor_sampah" ADD CONSTRAINT "setor_sampah_nasabahId_fkey" FOREIGN KEY ("nasabahId") REFERENCES "nasabah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setor_sampah" ADD CONSTRAINT "setor_sampah_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_setor" ADD CONSTRAINT "detail_setor_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "setor_sampah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_setor" ADD CONSTRAINT "detail_setor_kategoriSampahId_fkey" FOREIGN KEY ("kategoriSampahId") REFERENCES "kategori_sampah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_poin" ADD CONSTRAINT "penukaran_poin_nasabahId_fkey" FOREIGN KEY ("nasabahId") REFERENCES "nasabah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_poin" ADD CONSTRAINT "penukaran_poin_hadiahId_fkey" FOREIGN KEY ("hadiahId") REFERENCES "hadiah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
