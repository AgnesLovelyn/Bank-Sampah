import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePenukaranPoinDto {
  @IsString()
  @IsNotEmpty()
  hadiahId: string;
}