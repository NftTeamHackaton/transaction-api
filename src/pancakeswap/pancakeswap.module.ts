import { Module } from '@nestjs/common';
import { PancakeswapController } from './pancakeswap.controller';
import { PancakeswapService } from './pancakeswap.service';
import { TokenBuilder } from './tokens/token.builder';

@Module({
  controllers: [PancakeswapController],
  providers: [PancakeswapService, TokenBuilder]
})
export class PancakeswapModule {}
