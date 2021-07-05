import { Test, TestingModule } from '@nestjs/testing';
import { CompoundController } from './compound.controller';

describe('CompoundController', () => {
  let controller: CompoundController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompoundController],
    }).compile();

    controller = module.get<CompoundController>(CompoundController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
