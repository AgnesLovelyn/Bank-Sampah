import { PartialType } from '@nestjs/swagger';
import { CreateHadiahDto } from './create-hadiah.dto';

export class UpdateHadiahDto extends PartialType(CreateHadiahDto) {}