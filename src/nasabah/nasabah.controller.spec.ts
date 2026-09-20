import { Test, TestingModule } from '@nestjs/testing';
import { NasabahController } from './nasabah.controller';

describe('NasabahController', () => {
  let controller: NasabahController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NasabahController],
    }).compile();

    controller = module.get<NasabahController>(NasabahController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
