import { Test, TestingModule } from '@nestjs/testing';
import { RaydiumController } from './raydium.controller';

describe('RaydiumController', () => {
  let controller: RaydiumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaydiumController],
    }).compile();

    controller = module.get<RaydiumController>(RaydiumController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
