import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterAdminDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  namaUnit: string;

  @IsString()
  @IsNotEmpty()
  namaPengelola: string;

  @IsString()
  @MaxLength(12)
  telp: string;
}