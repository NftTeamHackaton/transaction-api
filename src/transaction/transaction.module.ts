import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AaveTokenBuilder } from 'src/aave/aaveToken.builder';
import { UniswapTokenBuilder } from 'src/uniswap/tokens/uniswapToken.builder';
import { PancakeTokenBuilder } from 'src/pancakeswap/tokens/pancakeToken.builder';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { Compound } from 'src/entities/compount.entity';
import { Erc20TransactionEntity } from 'src/entities/erc20Transaction.entity';
import { TransactionController } from './transaction.controller';
import { Bep20TransactionEntity } from 'src/entities/bep20Transaction.entity';
import { EthereumTransactionService } from './ethereumTransaction.service';
import { BscTransactionService } from './bscTransaction.service';
import { SolanaTransactionService } from './solanaTransaction.service';
import { CryptoAsset } from 'src/entities/cryptoAsset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Compound, Erc20TransactionEntity, Bep20TransactionEntity,CryptoAsset]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.getHttpTimeout(),
        maxRedirects: configService.getHttpMaxRedirects()
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [TransactionController],
  providers: [EthereumTransactionService, BscTransactionService, AaveTokenBuilder, UniswapTokenBuilder, PancakeTokenBuilder, SolanaTransactionService]
})
export class TransactionModule {}
