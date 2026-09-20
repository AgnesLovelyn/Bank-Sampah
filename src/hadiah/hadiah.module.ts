import { Module } from '@nestjs/common';
import { HadiahService } from './hadiah.service';
import { HadiahController } from './hadiah.controller';

@Module({
  providers: [HadiahService],
  controllers: [HadiahController]
})
export class HadiahModule {}
