import { Test, TestingModule } from '@nestjs/testing';
import { PancakeswapController } from './pancakeswap.controller';

describe('PancakeswapController', () => {
  let controller: PancakeswapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PancakeswapController],
    }).compile();

    controller = module.get<PancakeswapController>(PancakeswapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
