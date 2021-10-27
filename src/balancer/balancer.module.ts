import { Module } from '@nestjs/common';
// import { BalancerService } from './balancer.service';
import { BalancerController } from './balancer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoList } from 'src/entities/cryptoList.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CryptoList])],
  providers: [],
  controllers: [BalancerController]
})
export class BalancerModule {}
