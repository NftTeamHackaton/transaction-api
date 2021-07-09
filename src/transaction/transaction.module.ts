import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenBuilder as AaveTokenBuild } from 'src/aave/token.builder';
import { TokenBuilder as UniswapTokenBuild } from 'src/uniswap/tokens/token.builder';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { Compound } from 'src/entities/compount.entity';
import { Erc20TransactionEntity } from 'src/entities/erc20Transaction.entity';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

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
  controllers: [TransactionController],
  providers: [TransactionService, AaveTokenBuild, UniswapTokenBuild]
})
export class TransactionModule {}
