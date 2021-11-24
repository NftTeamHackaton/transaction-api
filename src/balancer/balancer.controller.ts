import { Body, Controller, /** Get, Param, Res */ 
Get,
Param,
Post,
Res} from '@nestjs/common';
import { Response } from 'express';
import { BalancerService } from './balancer.service';
import { PoolCalcLp } from './dto/poolCalcLp.dto';
import { PoolExitCalcDto } from './dto/poolExitCalc.dto';
import { PriceImpactDto } from './dto/priceImpact.dto';
import { ProportionalSuggestionDto } from './dto/proportionalSuggestion.dto';
import { BalancerSubgraph } from './subgraph/balancer.subgraph';
@Controller('balancer')
export class BalancerController {
    constructor(
        private readonly balancerService: BalancerService,
        private readonly balancerSubgraph: BalancerSubgraph
    ) {}

    @Post('/exit-pool-calc')
    public async exitPoolCalc(@Body() exitPoolCalcDto: PoolExitCalcDto, @Res() response: Response) {
        const data = await this.balancerService.calcAmounts({
            poolId: exitPoolCalcDto.poolId,
            amount: exitPoolCalcDto.amount,
            type: 'send',
            index: 0
        }, 'exit')
        return response.status(200).send(data)
    }

    @Get('/pool/user-info/:address') 
    public async userPoolInfo(@Param('address') address: string, @Res() response: Response) {
        const data = await this.balancerSubgraph.getMyPoolInfo(address)
        console.log(data)
        return response.status(200).send(data)
    }

    // poolId: string;
    // amount: string;
    // type: 'send' | 'receive';
    // index: number;

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
        const data = await this.balancerService.calcAmounts(calcProportional, 'join')
        return response.status(200).send(data)
    }

    @Post('/pool-calc')
    public async poolCalcLp(@Body() poolCalcLpDto: PoolCalcLp, @Res() response: Response) {
        const data = await this.balancerService.poolCalcLp(poolCalcLpDto)
        return response.status(200).send({data})
    }
}
