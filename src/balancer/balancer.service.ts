import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request'; 


// import {
//     SOR,
//     SwapTypes
// } from '@balancer-labs/sor2'  
// import { BigNumber as BigNumber$1, BigNumberish } from '@ethersproject/bignumber';
// import { JsonRpcProvider } from '@ethersproject/providers';
// import { ConfigService } from 'src/config/config.service';
// import { ChainId } from '@uniswap/sdk';
// import { Repository } from 'typeorm';
// import { CryptoList } from 'src/entities/cryptoList.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { CryptoAsset } from 'src/entities/cryptoAsset.entity';
// import { getSwap } from './balancer.utils'
// import { CryptoListEnum } from 'src/enums/cryptoList.enum';
// import { AddressZero } from '@ethersproject/constants';
@Injectable()
export class BalancerService {
//     constructor(
//         private readonly configService: ConfigService,
//         @InjectRepository(CryptoList)
//         private readonly cryptoListRepository: Repository<CryptoList>
//     ) {}
        constructor(@InjectGraphQLClient() private readonly client: GraphQLClient) {}


        public async getPools() {
            const ids = ["0x6b15a01b5d46a5321b627bd7deef1af57bc629070000000000000000000000d4", "0x3a19030ed746bd1c3f2b0f996ff9479af04c5f0a000200000000000000000004", "0x647c1fd457b95b75d0972ff08fe01d7d7bda05df000200000000000000000001"]
            const data = {pools: []}
            for(let i = 0; i < ids.length; i++) {
                const response = await this.client.request(`
                    {
                        pools(first: 10, skip: 0, where: {id: "${ids[i]}"}) {
                            id
                            address
                            poolType
                            strategyType
                            swapFee
                            amp
                        }
                    }
                    `)
                data.pools.push(response['pools'][0])
            }
            console.log(data)
            for(let i = 0; i < data.pools.length; i++) {
                const pool = data.pools[i]
                const poolTokens = await this.client.request(`
                {
                    poolTokens(first: 8, where: {poolId: "${pool.id}"}) {
                        id
                        symbol
                        name
                        decimals
                        address
                        balance
                        invested
                        investments
                        weight
                    }
                }
                `)
                data.pools[i].poolTokens = poolTokens.poolTokens
            }
            return data
        }
//     public async calculateOutput(network: string, tokenInSymbol: string, tokenOutSymbol: string, amount: string) {
//         const list = await this.cryptoListRepository.findOne({type: CryptoListEnum.BALANCER}, {relations: ['assets']})
//         const networkId = ChainId[network.toUpperCase()]
//         const poolsSource = this.configService.getSubgraphUrl(network.toLowerCase())
//         let tokenIn = {}
//         let tokenOut = {}
//         tokenIn = list.assets.find(function (asset) {
//             return asset.symbol == tokenInSymbol
//         })
//         tokenOut = list.assets.find(function (asset) {
//             return asset.symbol == tokenOutSymbol
//         })
//         if(tokenInSymbol == 'ETH') {
//             tokenIn = {
//                 contractAddress: AddressZero,
//                 decimals: 18,
//                 symbol: 'ETH',
//             }
//         }
//         if(tokenOutSymbol == 'ETH') {
//             tokenOut = {
//                 contractAddress: AddressZero,
//                 decimals: 18,
//                 symbol: 'ETH',
//             }
//         }

        
//         const swapType = SwapTypes.SwapExactIn;
//         const swapAmount = new BigNumber$1({}, amount); // In normalized format, i.e. 1USDC = 1
//         const provider = new JsonRpcProvider(this.configService.getInfuraURL(network));
//         const swapInfo = await getSwap(
//             provider,
//             networkId,
//             poolsSource,
//             tokenIn,
//             tokenOut,
//             swapType,
//             swapAmount
//         );
//         console.log(swapInfo)
//         return swapInfo
//     }
}
