import { Injectable } from '@nestjs/common';
import {
    SOR,
    SwapInfo,
    SwapTypes,
    scale,
    bnum,
    SubgraphPoolBase,
} from '@balancer-labs/sor2'  
import { JsonRpcProvider } from '@ethersproject/providers';
import { ConfigService } from 'src/config/config.service';
import { ChainId } from '@uniswap/sdk';

@Injectable()
export class BalancerService {
    constructor(
        private readonly configService: ConfigService
    ) {}

    public async test(network: string) {
        const provider = new JsonRpcProvider(this.configService.getInfuraURL(network));
        const sor = new SOR(provider, ChainId[network.toUpperCase()], this.configService.getSubgraphUrl(network.toLowerCase()));
        
    }
}
