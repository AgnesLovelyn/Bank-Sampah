import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterNasabahDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  namaNasabah: string;

  @IsString()
  @IsNotEmpty()
  alamat: string;

  @IsString()
  @MaxLength(12)
  telp: string;
}