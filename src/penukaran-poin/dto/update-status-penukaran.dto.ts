import { IsEnum } from 'class-validator';

export enum StatusPenukaranEnum {
  diproses = 'diproses',
  selesai = 'selesai',
}

export class UpdateStatusPenukaranDto {
  @IsEnum(StatusPenukaranEnum)
  status: StatusPenukaranEnum;
}