import { Module } from '@nestjs/common';
import { SetorSampahService } from './setor-sampah.service';
import { SetorSampahController } from './setor-sampah.controller';

@Module({
  providers: [SetorSampahService],
  controllers: [SetorSampahController]
})
export class SetorSampahModule {}
