import { Test, TestingModule } from '@nestjs/testing';
import { AaveController } from './aave.controller';

describe('AaveController', () => {
  let controller: AaveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AaveController],
    }).compile();

    controller = module.get<AaveController>(AaveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
