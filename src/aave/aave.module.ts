import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AaveInvest } from 'src/entities/aaveInvest.entity';
import { AaveController } from './aave.controller';
import { AaveService } from './aave.service';
import { AaveTokenBuilder } from './aaveToken.builder';

@Module({
  imports: [TypeOrmModule.forFeature([AaveInvest])],
  controllers: [AaveController],
  providers: [AaveService, AaveTokenBuilder]
})
export class AaveModule {}
