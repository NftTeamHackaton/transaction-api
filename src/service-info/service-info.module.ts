import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AaveTokenBuilder } from 'src/aave/aaveToken.builder';
import { ServiceInfoEntity } from 'src/entities/serviceInfo.entity';
import { ServiceInfoController } from './service-info.controller';
import { ServiceInfoService } from './service-info.service';
import { AaveService } from './services/aave/aave.service';
import { CompoundService } from './services/compound/compound.service';
import { Registry } from './services/registry';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceInfoEntity])],
  controllers: [ServiceInfoController],
  providers: [ServiceInfoService, Registry, CompoundService, AaveService, AaveTokenBuilder]
})
export class ServiceInfoModule {}
