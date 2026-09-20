import { Module } from '@nestjs/common';
import { PenukaranPoinController } from './penukaran-poin.controller';
import { PenukaranPoinService } from './penukaran-poin.service';

@Module({
  controllers: [PenukaranPoinController],
  providers: [PenukaranPoinService]
})
export class PenukaranPoinModule {}
