import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AaveTxDto } from './dto/aaveTx.dto';
import { CompoundTxDto } from './dto/compoundTx.dto';
import { UniswapTxDto } from './dto/uniswapTx.dto';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {

    constructor(
        private readonly transactionService: TransactionService,
    ) {}

    @Get('/compound/:network/:erc20Symbol/:address')
    public async compoundTransactionList(@Param('network') network: string, @Param('erc20Symbol') erc20Symbol: string, @Param('address') address: string, @Res() response: Response) {
        const result = await this.transactionService.getAllCompoundTransaction(network.toLowerCase(), erc20Symbol.toUpperCase(), address.toLowerCase());
        return response.status(200).send(result);
    }

    @Post('/compound/:network')
    public async newTxInCompound(@Param('network') network: string, @Body() compoundTxDto: CompoundTxDto, @Res() response: Response) {
        const transactions = await this.transactionService.newTxInCompound(network, compoundTxDto.erc20Symbol, compoundTxDto.сTokenSymbol, compoundTxDto.address.toLowerCase());
        return response.status(200).send({transactions})
    }

    @Post('/aave/:network')
    public async newTxInAave(@Param('network') network: string, @Body() aaveTxDto: AaveTxDto, @Res() response: Response) {
        const transactions = await this.transactionService.newTxInAave(network.toUpperCase(), aaveTxDto.erc20Symbol.toUpperCase(), aaveTxDto.address.toLowerCase());
        return response.status(200).send({transactions})
    }

    @Get('/aave/:network/:erc20Symbol/:address')
    public async aaveTransactionList(@Param('network') network: string, @Param('erc20Symbol') erc20Symbol: string, @Param('address') address: string, @Res() response: Response) {
        const result = await this.transactionService.getAllAaveTransaction(network.toUpperCase(), erc20Symbol.toUpperCase(), address.toLowerCase());
        return response.status(200).send(result);
    }

    @Post('/uniswap/:network')
    public async newTxInUniswap(@Param('network') network: string, @Body() uniswapTxDto: UniswapTxDto, @Res() response: Response) {
        const transactions = await this.transactionService.newTxInUniswap(network.toUpperCase(), uniswapTxDto.token0.toUpperCase(), uniswapTxDto.token1.toUpperCase(), uniswapTxDto.address.toLowerCase());
        return response.status(200).send({transactions})
    }

    @Get('/uniswap/:network/:token0/:token1/:address')
    public async uniswapTransactionList(@Param('network') network: string, @Param('token0') token0: string, @Param('token1') token1: string, @Param('address') address: string, @Res() response: Response) {
        const result = await this.transactionService.getAllUniswapTransaction(network.toUpperCase(), token0.toUpperCase(), token1.toUpperCase(), address.toLowerCase());
        return response.status(200).send(result);
    }
}
