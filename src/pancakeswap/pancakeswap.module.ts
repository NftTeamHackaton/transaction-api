import { Module } from '@nestjs/common';
import { PancakeswapController } from './pancakeswap.controller';
import { PancakeswapService } from './pancakeswap.service';
import { PancakeTokenBuilder } from './tokens/pancakeToken.builder';

@Module({
  controllers: [PancakeswapController],
  providers: [PancakeswapService, PancakeTokenBuilder]
})
export class PancakeswapModule {}
