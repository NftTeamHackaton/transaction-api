import { Test, TestingModule } from '@nestjs/testing';
import { SerumController } from './serum.controller';

describe('SerumController', () => {
  let controller: SerumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SerumController],
    }).compile();

    controller = module.get<SerumController>(SerumController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
