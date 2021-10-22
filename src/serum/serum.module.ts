import { Module } from '@nestjs/common';
import { SerumController } from './serum.controller';
import { SerumService } from './serum.service';

@Module({
  controllers: [SerumController],
  providers: [SerumService]
})
export class SerumModule {}
