import { Test, TestingModule } from '@nestjs/testing';
import { PancakeswapService } from './pancakeswap.service';

describe('PancakeswapService', () => {
  let service: PancakeswapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PancakeswapService],
    }).compile();

    service = module.get<PancakeswapService>(PancakeswapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
