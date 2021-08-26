import { Test, TestingModule } from '@nestjs/testing';
import { CryptoListController } from './crypto-list.controller';

describe('CryptoListController', () => {
  let controller: CryptoListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CryptoListController],
    }).compile();

    controller = module.get<CryptoListController>(CryptoListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
