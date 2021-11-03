import { CACHE_MANAGER, Controller, Get, Inject, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { LIQUIDITY_POOLS } from './raydium.pools';
import { bool, publicKey, struct, u32, u64, u8 } from '@project-serum/borsh'
import { getSwapOutAmount, requestInfos } from './raydium.utils';
import { Cache } from 'cache-manager';
@Controller('raydium')
export class RaydiumController {

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    @Get('/pools')
    public async getPoolList(@Res() response: Response) {
        return response.status(200).send(LIQUIDITY_POOLS)
    }

    @Get('/test')
    public async test(@Res() response: Response) {
        const data = await requestInfos()

        const t = 'mSOL-RAY'
        for (let key in data) {
            const pool = data[key]
            await this.cacheManager.set(pool.name, pool)
        }
        const f = await this.cacheManager.get(t)
        console.log("NEW_DATA")
        console.log(f)
        return response.status(200).send(data)
    }

    @Get('/calc-swap/:poolName/:fromCoinMint/:toCoinMint/:amount/:slippage')
    public async calcSwap(
        @Param('poolName') poolName: string,
        @Param('fromCoinMint') fromCoinMint: string,
        @Param('toCoinMint') toCoinMint: string,
        @Param('amount') amount: string,
        @Param('slippage') slippage: number,
        @Res() response: Response
    ) {
        console.log(poolName)
        const poolInfo = await this.cacheManager.get(poolName)
        const swapData = getSwapOutAmount(poolInfo, fromCoinMint, toCoinMint, amount, 1)
        return response.status(200).send(swapData)
    }

}
