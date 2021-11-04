import { Controller, /** Get, Param, Res */ 
Get,
Res} from '@nestjs/common';
import { Response } from 'express';
import { BalancerService } from './balancer.service';
@Controller('balancer')
export class BalancerController {
    constructor(
        private readonly balancerService: BalancerService
    ) {}

    @Get('/pools')
    public async calculatePrice(
        @Res() response: Response
    ) {
        const pool = await this.balancerService.getPools()
        return response.status(200).send(pool)
    }
}
