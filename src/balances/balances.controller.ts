import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { BalancesService } from './balances.service';

@Controller('balances')
export class BalancesController {

    constructor(
        private readonly balanceService: BalancesService
    ) {}

    @Get('/erc20/:address/:network')
    public async getErc20Balances(@Param('address') address: string, @Param('network') network: string, @Res() response: Response) {
        const balances = await this.balanceService.erc20Balances(address, network)
        return response.status(HttpStatus.OK).send(balances)
    }

    @Get('/erc20-batch/:address/:network')
    public async getErc20BalancesBatch(@Param('address') address: string, @Param('network') network: string, @Res() response: Response) {
        const balances = await this.balanceService.erc20BalancesBatch(address, network)
        console.log(balances)
        const data = balances.map(balance => {
            return {
                address: balance.address,
                balance: balance.balanceOf[0].value.length == 0 ? balance.balanceOf[0].value : "0",
                name: balance.name[0].value,
                symbol: balance.symbol[0].value,
                decimals: balance.decimals[0].value,
            }
        })
        return response.status(HttpStatus.OK).send(data)
    }

    @Get('/spl/:address')
    public async getSplBalances(@Param('address') address: string, @Res() response: Response) {
        const balances = await this.balanceService.splBalances(address)
        return response.status(HttpStatus.OK).send(balances)
    }

    @Get('/bep20/:address')
    public async getBep20Balances(@Param('address') address: string, @Res() response: Response) {
        const balances = await this.balanceService.bep20Balances(address)
        console.log(balances)
        const data = balances.map(balance => {
            return {
                address: balance.address,
                balance: balance.balanceOf[0].value,
                name: balance.name[0].value,
                symbol: balance.symbol[0].value,
                decimals: balance.decimals[0].value,
            }
        })
        return response.status(HttpStatus.OK).send(data)
    }
}
