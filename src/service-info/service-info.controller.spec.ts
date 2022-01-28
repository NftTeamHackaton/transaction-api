import { Test, TestingModule } from '@nestjs/testing';
import { ServiceInfoController } from './service-info.controller';

describe('ServiceInfoController', () => {
  let controller: ServiceInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceInfoController],
    }).compile();

    controller = module.get<ServiceInfoController>(ServiceInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
