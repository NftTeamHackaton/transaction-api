import { Module } from '@nestjs/common';
import { BalancerService } from './balancer.service';
import { BalancerController } from './balancer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoList } from 'src/entities/cryptoList.entity';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { BalancerSubgraph } from './subgraph/balancer.subgraph';
import { WeightedPool } from './pools/weighted.pool';
import { StablePool } from './pools/stable.pool';

@Module({
  imports: [
    GraphQLRequestModule.forRoot(GraphQLRequestModule, {
      // Exposes configuration options based on the graphql-request package
      endpoint: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-kovan-v2",
      options: {
        headers: {
          'content-type': 'application/json',
        },
      }
    }),
    TypeOrmModule.forFeature([CryptoList])
  ],
  providers: [BalancerService, BalancerSubgraph, WeightedPool, StablePool],
  controllers: [BalancerController]
})
export class BalancerModule {}
