import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AaveInvest } from 'src/entities/aaveInvest.entity';
import { AaveController } from './aave.controller';
import { AaveService } from './aave.service';
import { TokenBuilder } from './token.builder';

@Module({
  imports: [TypeOrmModule.forFeature([AaveInvest])],
  controllers: [AaveController],
  providers: [AaveService, TokenBuilder]
})
export class AaveModule {}
