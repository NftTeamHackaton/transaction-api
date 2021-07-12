import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { AaveService } from './aave.service';

@Controller('aave')
export class AaveController {
    constructor(private readonly aaveService: AaveService) {}

    @Get('/:network/apy')
    public async apyInfo(
        @Param('network') network: string,
        @Res() response: Response
    ) {
        const result = await this.aaveService.apyInfo(network);
        return response.status(200).send(result)
    }

    @Get('/:network/staked/:address')
    public async stakedInfo(
        @Param('network') network: string, 
        @Param('address') address: string, 
        @Res() response: Response
    ) {
        const result = await this.aaveService.stakedData(network, address);
        return response.status(200).send(result)
    }

    @Get('/:network/reward/:erc20Symbol/:address')
    public async rewardInfo(
        @Param('network') network: string, 
        @Param('erc20Symbol') erc20Symbol: string, 
        @Param('address') address: string, 
        @Res() response: Response
    ) {
        const result = await this.aaveService.getRewardData(network, erc20Symbol, address);
        return response.status(200).send(result)
    }
}
