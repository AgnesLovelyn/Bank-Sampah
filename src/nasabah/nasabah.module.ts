import { Module } from '@nestjs/common';
import { NasabahService } from './nasabah.service';
import { NasabahController } from './nasabah.controller';

@Module({
  providers: [NasabahService],
  controllers: [NasabahController]
})
export class NasabahModule {}
