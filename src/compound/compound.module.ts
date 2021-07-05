import { Module } from '@nestjs/common';
import { CompoundController } from './compound.controller';
import { CompoundService } from './compound.service';

@Module({
  controllers: [CompoundController],
  providers: [CompoundService]
})
export class CompoundModule {}
