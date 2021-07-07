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
    CompoundModule, AaveModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
