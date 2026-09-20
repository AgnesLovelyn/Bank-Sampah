import { Test, TestingModule } from '@nestjs/testing';
import { NasabahService } from './nasabah.service';

describe('NasabahService', () => {
  let service: NasabahService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NasabahService],
    }).compile();

    service = module.get<NasabahService>(NasabahService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
