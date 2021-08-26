import { Test, TestingModule } from '@nestjs/testing';
import { CryptoListService } from './crypto-list.service';

describe('CryptoListService', () => {
  let service: CryptoListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoListService],
    }).compile();

    service = module.get<CryptoListService>(CryptoListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
