import { IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateNasabahDto {
  @IsString()
  @IsNotEmpty()
  namaLengkap: string;

  @IsString()
  @MaxLength(12)
  noTelepon: string;

  @IsString()
  @IsNotEmpty()
  alamat: string;

}