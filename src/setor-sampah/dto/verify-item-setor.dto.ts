import { Type } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';

export class VerifyItemSetorDto {
  @IsString()
  kategoriSampahId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  beratKgReal: number;
}