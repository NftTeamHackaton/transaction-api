import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { BscTransactionService } from './bscTransaction.service';
import { AaveTxDto } from './dto/aaveTx.dto';
import { CompoundTxDto } from './dto/compoundTx.dto';
import { PancakeSwapDto } from './dto/pancakeSwapTx.dto';
import { UniswapTxDto } from './dto/uniswapTx.dto';
import { EthereumTransactionService} from './ethereumTransaction.service';

@Controller('transaction')
export class TransactionController {

    constructor(
        private readonly ethereumTransactionService: EthereumTransactionService,
        private readonly bscTransactionService: BscTransactionService
    ) {}

    @Get('/compound/:network/:erc20Symbol/:address')
    public async compoundTransactionList(@Param('network') network: string, @Param('erc20Symbol') erc20Symbol: string, @Param('address') address: string, @Res() response: Response) {
        const result = await this.ethereumTransactionService.getAllCompoundTransaction(network.toLowerCase(), erc20Symbol.toUpperCase(), address.toLowerCase());
        return response.status(200).send(result);
    }

    @Post('/compound/:network')
    public async newTxInCompound(@Param('network') network: string, @Body() compoundTxDto: CompoundTxDto, @Res() response: Response) {
        const transactions = await this.ethereumTransactionService.newTxInCompound(network, compoundTxDto.erc20Symbol, compoundTxDto.сTokenSymbol, compoundTxDto.address.toLowerCase(), compoundTxDto.operation.toLowerCase());
        return response.status(200).send({transactions})
    }

    @Post('/aave/:network')
    public async newTxInAave(@Param('network') network: string, @Body() aaveTxDto: AaveTxDto, @Res() response: Response) {
        const transactions = await this.ethereumTransactionService.newTxInAave(network.toUpperCase(), aaveTxDto.erc20Symbol.toUpperCase(), aaveTxDto.address.toLowerCase(), aaveTxDto.operation.toLowerCase());
        return response.status(200).send({transactions})
    }

    @Get('/aave/:network/:erc20Symbol/:address')
    public async aaveTransactionList(@Param('network') network: string, @Param('erc20Symbol') erc20Symbol: string, @Param('address') address: string, @Res() response: Response) {
        const result = await this.ethereumTransactionService.getAllAaveTransaction(network.toUpperCase(), erc20Symbol.toUpperCase(), address.toLowerCase());
        return response.status(200).send(result);
    }

    @Post('/uniswap/:network')
    public async newTxInUniswap(@Param('network') network: string, @Body() uniswapTxDto: UniswapTxDto, @Res() response: Response) {
        const transactions = await this.ethereumTransactionService.newTxInUniswap(network.toUpperCase(), uniswapTxDto.token0.toUpperCase(), uniswapTxDto.token1.toUpperCase(), uniswapTxDto.address.toLowerCase(), uniswapTxDto.operation.toLowerCase());
        return response.status(200).send({transactions})
    }

    @Get('/uniswap/:network/:token0/:token1/:address')
    public async uniswapTransactionList(@Param('network') network: string, @Param('token0') token0: string, @Param('token1') token1: string, @Param('address') address: string, @Res() response: Response) {
        const result = await this.ethereumTransactionService.getAllUniswapTransaction(network.toUpperCase(), token0.toUpperCase(), token1.toUpperCase(), address.toLowerCase());
        return response.status(200).send(result);
    }

    @Post('/pancakeswap/:network')
    public async newTxInPancakeSwap(@Param('network') network: string, @Body() pancakeSwapDto: PancakeSwapDto, @Res() response: Response) {
        const transactions = await this.bscTransactionService.newTxInPancakeSwap(network.toUpperCase(), pancakeSwapDto.token0.toUpperCase(), pancakeSwapDto.token1.toUpperCase(), pancakeSwapDto.address.toLowerCase(), pancakeSwapDto.operation.toLowerCase());
        return response.status(200).send({transactions})
    }

    @Get('/pancakeswap/:network/:token0/:token1/:address')
    public async pancakeSwapTransactionList(@Param('network') network: string, @Param('token0') token0: string, @Param('token1') token1: string, @Param('address') address: string, @Res() response: Response) {
        const result = await this.bscTransactionService.getAllPancakeSwapTransaction(network.toUpperCase(), token0.toUpperCase(), token1.toUpperCase(), address.toLowerCase());
        return response.status(200).send(result);
    }
}
