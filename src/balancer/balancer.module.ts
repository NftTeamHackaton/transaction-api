import { Module } from '@nestjs/common';
import { BalancerService } from './balancer.service';
import { BalancerController } from './balancer.controller';

@Module({
  providers: [BalancerService],
  controllers: [BalancerController]
})
export class BalancerModule {}
