import { Module } from '@nestjs/common';
import { RaydiumController } from './raydium.controller';
import { RaydiumService } from './raydium.service';

@Module({
  controllers: [RaydiumController],
  providers: [RaydiumService]
})
export class RaydiumModule {}
