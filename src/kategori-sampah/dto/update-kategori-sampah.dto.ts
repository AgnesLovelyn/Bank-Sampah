import { PartialType } from '@nestjs/swagger';
import { CreateKategoriSampahDto } from './create-kategori-sampah.dto';

export class UpdateKategoriSampahDto extends PartialType(CreateKategoriSampahDto) {}