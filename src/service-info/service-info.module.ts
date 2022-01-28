import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceInfoEntity } from 'src/entities/serviceInfo.entity';
import { ServiceInfoController } from './service-info.controller';
import { ServiceInfoService } from './service-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceInfoEntity])],
  controllers: [ServiceInfoController],
  providers: [ServiceInfoService]
})
export class ServiceInfoModule {}
