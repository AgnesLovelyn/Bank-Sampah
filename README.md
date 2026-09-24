# ♻️ Bank Sampah Digital - Eco-Waste Management System

Bank Sampah Digital adalah sistem backend berbasis REST API untuk pengelolaan bank sampah, memungkinkan Nasabah mengajukan penyetoran sampah daur ulang dan menukarkan poin dengan hadiah, sementara Admin mengelola master data, memverifikasi transaksi, dan memantau rekapitulasi bulanan.

Project ini dikerjakan untuk **Uji Kompetensi Keahlian (UKK) RPL 2026/2027 - Kategori Backend**.

## 🛠️ Teknologi yang Digunakan

- **Framework:** NestJS (TypeScript)
- **ORM:** Prisma 7 (dengan driver adapter `@prisma/adapter-pg`)
- **Database:** PostgreSQL (Supabase)
- **Autentikasi:** JWT (`@nestjs/jwt`, `@nestjs/passport`), password di-hash dengan bcrypt
- **Upload Foto:** Cloudinary
- **Dokumentasi API:** Swagger (`@nestjs/swagger`)
- **Deployment:** Railway

## ✨ Fitur Utama

### Nasabah
- Register & login mandiri
- Melihat daftar kategori sampah beserta harga & poin per kg
- Mengajukan penyetoran sampah (multi-item dalam satu transaksi)
- Melihat status & histori penyetoran (filter per bulan)
- Melihat saldo poin & dashboard ringkasan pribadi
- Menukarkan poin dengan hadiah/voucher
- Melihat nota/struk transaksi

### Admin
- Register unit bank sampah & login
- CRUD data Nasabah
- CRUD Kategori Sampah (jenis, harga/kg, poin/kg)
- CRUD Hadiah/voucher penukaran poin
- Verifikasi & penimbangan ulang pengajuan setor sampah
- Update status transaksi penukaran poin
- Rekapitulasi tonase sampah & estimasi pembayaran per bulan
- Dashboard statistik keseluruhan sistem

## 📁 Struktur Modul

```
src/
├── auth/               # Register, login, JWT
├── nasabah/             # CRUD nasabah (oleh admin)
├── kategori-sampah/     # CRUD master kategori sampah
├── setor-sampah/        # Pengajuan & verifikasi penyetoran
├── hadiah/               # CRUD katalog hadiah
├── penukaran-poin/       # Transaksi tukar poin
├── rekapitulasi/         # Laporan bulanan (admin)
├── dashboard/             # Ringkasan statistik (nasabah & admin)
├── seed/                  # Generate data dummy
├── prisma/                # PrismaService (koneksi database)
└── common/
    ├── guards/            # JwtAuthGuard, RolesGuard
    ├── decorators/        # @Roles(), @CurrentUser()
    ├── interceptors/       # TransformInterceptor (format response)
    ├── filters/            # HttpExceptionFilter (format error)
    └── cloudinary/         # CloudinaryService (upload foto)
```

## 📌 Endpoint API

Semua endpoint diawali prefix `/api/v1`. Dokumentasi interaktif lengkap tersedia di Swagger (`/api/docs`).

| Modul | Endpoint | Method | Auth |
|---|---|---|---|
| Auth | `/auth/nasabah/register` | POST | Publik |
| Auth | `/auth/admin/register` | POST | Publik |
| Auth | `/auth/login` | POST | Publik |
| Auth | `/auth/me` | GET | Bearer Token |
| Nasabah | `/admin/nasabah` | GET, POST | Bearer Token (Admin) |
| Nasabah | `/admin/nasabah/:id` | GET, PUT, DELETE | Bearer Token (Admin) |
| Kategori Sampah | `/kategori-sampah` | GET | Publik |
| Kategori Sampah | `/kategori-sampah` | POST | Bearer Token (Admin) |
| Kategori Sampah | `/kategori-sampah/:id` | GET | Publik |
| Kategori Sampah | `/kategori-sampah/:id` | PUT, DELETE | Bearer Token (Admin) |
| Setor Sampah | `/setor-sampah/pengajuan` | POST | Bearer Token (Nasabah) |
| Setor Sampah | `/setor-sampah/my-setor` | GET | Bearer Token (Nasabah) |
| Setor Sampah | `/setor-sampah/admin/list` | GET | Bearer Token (Admin) |
| Setor Sampah | `/setor-sampah/:id` | GET | Bearer Token |
| Setor Sampah | `/setor-sampah/admin/verify/:id` | PUT | Bearer Token (Admin) |
| Hadiah | `/hadiah` | GET | Publik |
| Hadiah | `/hadiah` | POST | Bearer Token (Admin) |
| Hadiah | `/hadiah/:id` | GET | Publik |
| Hadiah | `/hadiah/:id` | PUT, DELETE | Bearer Token (Admin) |
| Penukaran Poin | `/penukaran-poin/tukar` | POST | Bearer Token (Nasabah) |
| Penukaran Poin | `/penukaran-poin/my-penukaran` | GET | Bearer Token (Nasabah) |
| Penukaran Poin | `/penukaran-poin/admin/list` | GET | Bearer Token (Admin) |
| Penukaran Poin | `/penukaran-poin/admin/status/:id` | PUT | Bearer Token (Admin) |
| Penukaran Poin | `/penukaran-poin/nota/:id` | GET | Bearer Token |
| Rekapitulasi | `/rekapitulasi/bulanan?bulan=YYYY-MM` | GET | Bearer Token (Admin) |
| Dashboard | `/dashboard/summary` | GET | Bearer Token (Nasabah) |
| Dashboard | `/dashboard/stats` | GET | Bearer Token (Admin) |
| Seed | `/seed` | POST | Publik (sekali generate) |

## 🗂️ Skema Database

8 model utama: `User`, `Nasabah`, `AdminBank`, `KategoriSampah`, `SetorSampah`, `DetailSetor`, `Hadiah`, `PenukaranPoin`. Lihat detail lengkap di `prisma/schema.prisma`.

## 🔑 Kredensial Default (dari Seed)

| Role | Username | Password |
|---|---|---|
| Admin | `admin_banksampah` | `admin123` |
| Nasabah | `nasabah_budi` | `password123` |
| Nasabah | `nasabah_siti` | `password123` |

Panggil `POST /api/v1/seed` untuk generate data ini beserta 4 kategori sampah, 3 hadiah, dan riwayat transaksi contoh. Seed hanya bisa dijalankan sekali (ditolak jika data admin sudah ada).

## ⚙️ Environment Variables

Buat file `.env` di root project, isi sesuai `.env.example`:

```dotenv
DATABASE_URL=postgresql://user:password@host:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://user:password@host:5432/postgres
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 Cara Menjalankan Aplikasi

**1. Clone & install dependency**
```bash
git clone https://github.com/<username>/<nama-repo>.git
cd <nama-repo>
npm install
```

**2. Setup environment variables**

Isi `.env` sesuai contoh di atas.

**3. Migration database**
```bash
npx prisma generate
npx prisma migrate dev
```

**4. Jalankan server**
```bash
npm run start:dev
```

Server berjalan di `http://localhost:3000/api/v1`, dokumentasi Swagger di `http://localhost:3000/api/docs`.

**5. (Opsional) Generate data dummy**
```bash
curl -X POST http://localhost:3000/api/v1/seed
```

## 📝 Catatan Desain

- **Tanpa mekanisme App Maker / multi-tenant (`x-app-key`):** karena kategori Backend membuat database sendiri yang dikelola sendiri, isolasi data antar siswa tidak diperlukan. Seluruh admin & nasabah berbagi satu ruang data yang sama (bukan sistem multi-unit/mitra terpisah).
- **Registrasi Admin bersifat publik:** sesuai kontrak API yang diberikan, tanpa lapisan approval. Untuk produksi nyata, disarankan menambahkan verifikasi manual atau kode undangan.
- **Field `tanggalLahir` pada update Nasabah tidak diimplementasikan:** skema database tidak menyimpan tanggal lahir nasabah, sehingga field ini dihapus dari DTO alih-alih menerima data yang tidak tersimpan.
- **Poin baru masuk ke saldo nasabah setelah verifikasi Admin berstatus "selesai"**, bukan saat pengajuan — mencegah klaim berat sampah yang tidak akurat, dan dilindungi dari double-verification.
- **Upload foto disimpan di Cloudinary**, bukan lokal — mengurangi beban storage server dan mendukung deployment tanpa kehilangan file saat redeploy.

## 🌐 Deployment

Aplikasi di-deploy ke **Railway**, terhubung dengan database Supabase yang sama dengan environment development.
