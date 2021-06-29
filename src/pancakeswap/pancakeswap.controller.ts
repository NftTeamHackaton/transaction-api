import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { PancakeswapService } from './pancakeswap.service';

@Controller('pancakeswap')
export class PancakeswapController {
    constructor(private readonly pancakeSwapService: PancakeswapService) {}

    @Get('/:network/calculate/:token0/:token1/:amount')
    public async calculatePrice(@Param('network') network: string, @Param('token0') token0: string, @Param('token1') token1: string, @Param('amount') amount: string, @Res() response: Response) {
        const result = await this.pancakeSwapService.calculatePrice(network, token0, token1, amount)
        return response.send(result).status(200)
    }
}
