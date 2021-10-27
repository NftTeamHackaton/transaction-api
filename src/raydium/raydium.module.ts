import { CacheModule, Module } from '@nestjs/common';
import { RaydiumController } from './raydium.controller';
import { RaydiumService } from './raydium.service';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
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
  ],
  controllers: [RaydiumController],
  providers: [RaydiumService]
})
export class RaydiumModule {}
