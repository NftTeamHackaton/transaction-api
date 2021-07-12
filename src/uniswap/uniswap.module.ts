import { Module } from '@nestjs/common';
import { UniswapTokenBuilder } from './tokens/uniswapToken.builder';
import { UniswapController } from './uniswap.controller';
import { UniswapService } from './uniswap.service';

@Module({
  controllers: [UniswapController],
  providers: [UniswapService, UniswapTokenBuilder]
})
export class UniswapModule {}
