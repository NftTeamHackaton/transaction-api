import { Body, Controller, /** Get, Param, Res */ 
Get,
Post,
Res} from '@nestjs/common';
import { Response } from 'express';
import { BalancerService } from './balancer.service';
import { PoolCalcLp } from './dto/poolCalcLp.dto';
import { PriceImpactDto } from './dto/priceImpact.dto';
import { ProportionalSuggestionDto } from './dto/proportionalSuggestion.dto';
@Controller('balancer')
export class BalancerController {
    constructor(
        private readonly balancerService: BalancerService
    ) {}

    @Get('/pools')
    public async getPools(
        @Res() response: Response
    ) {
        const pool = await this.balancerService.getPools()
        return response.status(200).send(pool)
    }

    @Post('/price-impact')
    public async priceImpact(@Body() priceImpactDto: PriceImpactDto, @Res() response: Response) {
        const data = await this.balancerService.priceImpact(priceImpactDto)
        return response.status(200).send({priceImpact: data})
    }

    @Post('/calc-proportional')
    public async poolCalc(@Body() calcProportional: ProportionalSuggestionDto, @Res() response: Response) {
        const data = await this.balancerService.calcAmounts(calcProportional)
        return response.status(200).send(data)
    }

    @Post('/pool-calc')
    public async poolCalcLp(@Body() poolCalcLpDto: PoolCalcLp, @Res() response: Response) {
        const data = await this.balancerService.poolCalcLp(poolCalcLpDto)
        return response.status(200).send({data})
    }
}
