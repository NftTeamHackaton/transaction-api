import { Test, TestingModule } from '@nestjs/testing';
import { ServiceInfoService } from './service-info.service';

describe('ServiceInfoService', () => {
  let service: ServiceInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceInfoService],
    }).compile();

    service = module.get<ServiceInfoService>(ServiceInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
