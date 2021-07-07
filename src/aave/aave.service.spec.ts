import { Test, TestingModule } from '@nestjs/testing';
import { AaveService } from './aave.service';

describe('AaveService', () => {
  let service: AaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AaveService],
    }).compile();

    service = module.get<AaveService>(AaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
