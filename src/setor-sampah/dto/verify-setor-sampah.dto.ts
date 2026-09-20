import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { VerifyItemSetorDto } from './verify-item-setor.dto';

export enum StatusVerifikasiEnum {
  diverifikasi = 'diverifikasi',
  ditolak = 'ditolak',
  selesai = 'selesai',
}

export class VerifySetorSampahDto {
  @IsEnum(StatusVerifikasiEnum)
  status: StatusVerifikasiEnum;

  @IsOptional()
  @IsString()
  catatanAdmin?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VerifyItemSetorDto)
  itemsReal?: VerifyItemSetorDto[];
}