import { Injectable } from '@nestjs/common';
import {
    SOR,
    SwapTypes
} from '@balancer-labs/sor2'  
import { BigNumber } from 'bignumber.js';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ConfigService } from 'src/config/config.service';
import { ChainId } from '@uniswap/sdk';
import { Repository } from 'typeorm';
import { CryptoList } from 'src/entities/cryptoList.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoAsset } from 'src/entities/cryptoAsset.entity';
import { getSwap } from './balancer.utils'
import { CryptoListEnum } from 'src/enums/cryptoList.enum';
import { AddressZero } from '@ethersproject/constants';
@Injectable()
export class BalancerService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(CryptoList)
        private readonly cryptoListRepository: Repository<CryptoList>
    ) {}

    public async calculateOutput(network: string, tokenInSymbol: string, tokenOutSymbol: string, amount: string) {
        const list = await this.cryptoListRepository.findOne({type: CryptoListEnum.BALANCER}, {relations: ['assets']})
        const networkId = ChainId[network.toUpperCase()]
        const poolsSource = this.configService.getSubgraphUrl(network.toLowerCase())
        let tokenIn = {}
        let tokenOut = {}
        tokenIn = list.assets.find(function (asset) {
            return asset.symbol == tokenInSymbol
        })
        tokenOut = list.assets.find(function (asset) {
            return asset.symbol == tokenOutSymbol
        })
        if(tokenInSymbol == 'ETH') {
            tokenIn = {
                contractAddress: AddressZero,
                decimals: 18,
                symbol: 'ETH',
            }
        }
        if(tokenOutSymbol == 'ETH') {
            tokenOut = {
                contractAddress: AddressZero,
                decimals: 18,
                symbol: 'ETH',
            }
        }

        
        const swapType = SwapTypes.SwapExactIn;
        const swapAmount = new BigNumber(amount); // In normalized format, i.e. 1USDC = 1
        const provider = new JsonRpcProvider(this.configService.getInfuraURL(network));
        const swapInfo = await getSwap(
            provider,
            networkId,
            poolsSource,
            tokenIn,
            tokenOut,
            swapType,
            swapAmount
        );
        console.log(swapInfo)
        return swapInfo
    }
}
