import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { Compound } from 'src/entities/compount.entity';
import { Erc20TransactionEntity } from 'src/entities/erc20Transaction.entity';
import { CompoundController } from './compound.controller';
import { CompoundService } from './compound.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Compound, Erc20TransactionEntity]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.getHttpTimeout(),
        maxRedirects: configService.getHttpMaxRedirects(),
        baseURL: configService.getEtherscanApiBaseUrl()
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [CompoundController],
  providers: [CompoundService]
})
export class CompoundModule {}
