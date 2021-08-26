import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoAsset } from 'src/entities/cryptoAsset.entity';
import { CryptoList } from 'src/entities/cryptoList.entity';
import { CryptoListController } from './crypto-list.controller';
import { CryptoListService } from './crypto-list.service';

@Module({
  imports: [TypeOrmModule.forFeature([CryptoAsset, CryptoList])],
  controllers: [CryptoListController],
  providers: [CryptoListService]
})
export class CryptoListModule {}
