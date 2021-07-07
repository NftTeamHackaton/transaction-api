import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compound } from 'src/entities/compount.entity';
import { CompoundController } from './compound.controller';
import { CompoundService } from './compound.service';

@Module({
  imports: [TypeOrmModule.forFeature([Compound])],
  controllers: [CompoundController],
  providers: [CompoundService]
})
export class CompoundModule {}
