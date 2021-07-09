import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CompoundService } from './compound.service';
import { StakingDto } from './staking.dto';

@Controller('compound')
export class CompoundController {
    constructor(private readonly compoundService: CompoundService) {}

    @Get('/:network/history/:erc20Symbol/:address')
    public async test(@Param('network') network: string, @Param('erc20Symbol') erc20Symbol: string, @Param('address') address: string, @Res() response: Response) {
        const transaction = await this.compoundService.getCompoundHistory(network, erc20Symbol, address.toLowerCase());
        return response.status(200).send({transaction})
    }

    @Get('/:network/staked/:address')
    public async stakedBalance(
        @Param('network') network: string, 
        @Param('address') address: string, 
        @Res() response: Response
    ) {
        const result = await this.compoundService.stakedBalance(network, address);
        return response.status(200).send(result)
    }

    @Get('/:network/reward/:erc20Symbol/:cTokenSymbol/:address')
    public async rewardData(
        @Param('network') network: string, 
        @Param('erc20Symbol') erc20Symbol: string, 
        @Param('cTokenSymbol') cTokenSymbol: string, 
        @Param('address') address: string, 
        @Res() response: Response
    ) {
        const result = await this.compoundService.getRewardData(network, erc20Symbol, cTokenSymbol, address);
        return response.status(200).send(result)
    }

    @Get('/:network/comp/:address')
    public async compData(@Param('network') network: string, @Param('address') address: string, @Res() response: Response) {
        const result = await this.compoundService.getCompData(network, address);
        return response.status(200).send(result);
    }

    @Post('/:network/staking')
    public async staking(@Param('network') network: string, @Body() stakingDto: StakingDto, @Res() response: Response) {
        const result = await this.compoundService.staking(network, stakingDto)
        return response.status(200).send(result)
    }
}
