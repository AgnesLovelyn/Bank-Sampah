import { Type } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';

export class ItemSetorDto {
  @IsString()
  kategoriSampahId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  beratKg: number;
}