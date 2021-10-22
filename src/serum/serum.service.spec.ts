import { Test, TestingModule } from '@nestjs/testing';
import { SerumService } from './serum.service';

describe('SerumService', () => {
  let service: SerumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SerumService],
    }).compile();

    service = module.get<SerumService>(SerumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
