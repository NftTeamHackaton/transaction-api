import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UniswapModule } from './uniswap/uniswap.module';
import { PancakeswapModule } from './pancakeswap/pancakeswap.module';
import { CompoundModule } from './compound/compound.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AaveModule } from './aave/aave.module';
import { TransactionModule } from './transaction/transaction.module';
import { StoriesModule } from './stories/stories.module';
import { MinioClientModule } from './minio-client/minio-client.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.getTypeOrmConfig();
      }
    }),
    ScheduleModule.forRoot(),
    UniswapModule, 
    ConfigModule,
    PancakeswapModule, 
    CompoundModule, AaveModule, TransactionModule, StoriesModule, MinioClientModule, FeedbackModule, AnalyticsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
