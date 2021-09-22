import { Test, TestingModule } from '@nestjs/testing';
import { BalancerService } from './balancer.service';

describe('BalancerService', () => {
  let service: BalancerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BalancerService],
    }).compile();

    service = module.get<BalancerService>(BalancerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
