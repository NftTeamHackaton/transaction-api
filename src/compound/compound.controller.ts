import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CompoundService } from './compound.service';
import { StakingDto } from './staking.dto';
import { TransactionDto } from './transaction.dto';

@Controller('compound')
export class CompoundController {
    constructor(private readonly compoundService: CompoundService) {}

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

    @Get('/:network/transaction-list/:erc20Symbol/:address')
    public async transactionList(@Param('network') network: string, @Param('erc20Symbol') erc20Symbol: string, @Param('address') address: string, @Res() response: Response) {
        const result = await this.compoundService.getAllCompoundTransaction(network.toLowerCase(), erc20Symbol.toUpperCase(), address.toLowerCase());
        return response.status(200).send(result);
    }

    @Post('/:network/staking')
    public async staking(@Param('network') network: string, @Body() stakingDto: StakingDto, @Res() response: Response) {
        const result = await this.compoundService.staking(network, stakingDto)
        return response.status(200).send(result)
    }

    @Post('/:network/transaction')
    public async newTxInCompound(
        @Param('network') network: string,
        @Body() transactionDto: TransactionDto,
        @Res() response: Response
    ) {
        const transactions = await this.compoundService.newTxInCompound(network, transactionDto.erc20Symbol, transactionDto.сTokenSymbol, transactionDto.address.toLowerCase());
        return response.status(200).send({transactions})
    }
}
