import { Controller /** Get, Param, Res */ } from '@nestjs/common';
// import { Response } from 'express';
// import { BalancerService } from './balancer.service';

@Controller('balancer')
export class BalancerController {
    constructor(
        // private readonly balancerService: BalancerService
    ) {}

    // @Get('/:network/:tokenIn/:tokenOut/:amount')
    // public async calculatePrice(
    //     @Param('network') network: string,
    //     @Param('tokenIn') tokenIn: string,
    //     @Param('tokenOut') tokenOut: string,
    //     @Param('amount') amount: string,
    //     @Res() response: Response
    // ) {
    //     // const swapInfo = await this.balancerService.calculateOutput(network, tokenIn, tokenOut, amount)
    //     return response.status(200).send(true)
    // }
}
