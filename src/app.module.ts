import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UniswapModule } from './uniswap/uniswap.module';
import { PancakeswapModule } from './pancakeswap/pancakeswap.module';

@Module({
  imports: [UniswapModule, PancakeswapModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
