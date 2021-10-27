import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Erc20TransactionEntity } from 'src/entities/erc20Transaction.entity';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import * as redisStore from 'cache-manager-redis-store';
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: parseInt(configService.get('REDIS_PORT')),
        
      }),
      inject: [ConfigService]
    }),
    TypeOrmModule.forFeature([Erc20TransactionEntity]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.getCoinMarketCapURL(),
        headers: {
          'X-CMC_PRO_API_KEY': configService.getCoinMarketCapKey(),
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController]
})
export class AnalyticsModule {}
