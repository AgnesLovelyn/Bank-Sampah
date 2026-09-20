import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export enum JenisSampahEnum {
  plastik = 'plastik',
  kertas = 'kertas',
  logam = 'logam',
  kaca = 'kaca',
}

export class CreateKategoriSampahDto {
  @IsString()
  @IsNotEmpty()
  namaKategori: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hargaPerKg: number;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  poinPerKg: number;

  @IsEnum(JenisSampahEnum)
  jenis: JenisSampahEnum;
}