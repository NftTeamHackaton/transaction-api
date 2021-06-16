import { Module } from '@nestjs/common';
import { TokenBuilder } from './tokens/token.builder';
import { UniswapController } from './uniswap.controller';
import { UniswapService } from './uniswap.service';

@Module({
  controllers: [UniswapController],
  providers: [UniswapService, TokenBuilder]
})
export class UniswapModule {}
