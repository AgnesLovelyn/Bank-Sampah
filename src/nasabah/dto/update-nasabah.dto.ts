import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateNasabahDto {
  @IsString()
  @IsNotEmpty()
  namaLengkap: string;

  @IsString()
  @MinLength(11)
  noTelepon: string;

  @IsString()
  @IsNotEmpty()
  alamat: string;

  @IsOptional()
  @IsString()
  tanggalLahir?: string; // diterima tapi belum disimpan — schema belum punya kolom ini
}