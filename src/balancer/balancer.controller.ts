import { Body, Controller, /** Get, Param, Res */ 
Get,
HttpStatus,
Param,
Post,
Res} from '@nestjs/common';
import { Response } from 'express';
import { BalancerService } from './balancer.service';
import { ExitPoolEncodeFunctionDto } from './dto/exitPoolEncodeFunction.dto';
import { PoolCalcLp } from './dto/poolCalcLp.dto';
import { PoolExitCalcDto } from './dto/poolExitCalc.dto';
import { PoolExitSingleCalcDto } from './dto/poolExitSingleCalc.dto';
import { PriceImpactDto } from './dto/priceImpact.dto';
import { ProportionalSuggestionDto } from './dto/proportionalSuggestion.dto';
import { BalancerSubgraph } from './subgraph/balancer.subgraph';
@Controller('balancer')
export class BalancerController {
    constructor(
        private readonly balancerService: BalancerService,
        private readonly balancerSubgraph: BalancerSubgraph
    ) {}

    @Post('/exit-encode-function')
    public async exitEncodeFuction(@Body() exitEncodeFunctionDto: ExitPoolEncodeFunctionDto, @Res() response: Response) {
        const data = await this.balancerService.exitPoolEncodeFunction(exitEncodeFunctionDto)
        return response.status(HttpStatus.OK).send({data})
    }

    @Post('/exit-pool-calc-all')
    public async exitPoolCalc(@Body() exitPoolCalcDto: PoolExitCalcDto, @Res() response: Response) {
        const data = await this.balancerService.calcAmounts({
            poolId: exitPoolCalcDto.poolId,
            amount: exitPoolCalcDto.amount,
            type: 'send',
            index: 0
        }, 'exit')
        return response.status(200).send(data)
    }

    @Post('/exit-pool-calc-single')
    public async exitPoolCalcSingle(@Body() exitPoolCalcDto: PoolExitSingleCalcDto, @Res() response: Response) {
        const data = await this.balancerService.exitPoolSingleAsset(exitPoolCalcDto)
        return response.status(200).send({value: data})
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
