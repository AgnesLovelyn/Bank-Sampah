import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateNasabahDto {
  @IsString()
  @IsNotEmpty()
  namaLengkap: string;

  @IsString()
  @IsNotEmpty()
  noTelepon: string;

  @IsString()
  @IsNotEmpty()
  alamat: string;

  @IsOptional()
  @IsString()
  tanggalLahir?: string; // diterima tapi belum disimpan — schema belum punya kolom ini
}