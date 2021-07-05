import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UniswapModule } from './uniswap/uniswap.module';
import { PancakeswapModule } from './pancakeswap/pancakeswap.module';
import { CompoundModule } from './compound/compound.module';

@Module({
  imports: [UniswapModule, PancakeswapModule, CompoundModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
