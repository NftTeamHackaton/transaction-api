import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UniswapModule } from './uniswap/uniswap.module';

@Module({
  imports: [UniswapModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
