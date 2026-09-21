import { IsNotEmpty, IsString, MinLength } from 'class-validator';

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
  @MinLength(11)
  telp: string;
}