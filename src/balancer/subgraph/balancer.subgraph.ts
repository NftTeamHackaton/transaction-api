import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request'; 

@Injectable()
export class BalancerSubgraph {
    constructor(
        @InjectGraphQLClient() private readonly client: GraphQLClient,
    ) {}

    public async getPoolsByIds(ids: string[]) {
        const data = {pools: []}
        for(let i = 0; i < ids.length; i++) {
            const response = await this.client.request(`
                {
                    pools(first: 10, skip: 0, where: {id: "${ids[i]}"}) {
                        id
                        name
                        symbol
                        address
                        poolType
                        strategyType
                        swapFee
                        amp
                        totalSwapFee
                        totalShares
                        totalLiquidity
                        tokensList
                        tokens {
                            id
                            symbol
                            name
                            balance
                            weight
                            decimals
                            address
                        }
                    }
                }
                `)
            data.pools.push(response['pools'][0])
        }
        return data
    }

    public async getMyPoolInfo(address: string) {
        return this.client.request(`
            {
                poolShares(first: 1000, where: {userAddress: "${address.toLowerCase()}", balance_gt: 0}) {
                    id
                    balance
                    poolId {
                        id
                        totalShares
                        tokens {
                            id
                            symbol
                            name
                            decimals
                            address
                        }
                    }
                }
            }
        `)
    }
}