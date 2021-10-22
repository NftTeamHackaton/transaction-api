import { Test, TestingModule } from '@nestjs/testing';
import { RaydiumService } from './raydium.service';

describe('RaydiumService', () => {
  let service: RaydiumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RaydiumService],
    }).compile();

    service = module.get<RaydiumService>(RaydiumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
