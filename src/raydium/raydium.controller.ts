import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { LIQUIDITY_POOLS } from './raydium.pools';

@Controller('raydium')
export class RaydiumController {

    @Get('/pools')
    public async getPoolList(@Res() response: Response) {
        return response.status(200).send(LIQUIDITY_POOLS)
    }

}
