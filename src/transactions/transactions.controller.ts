import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {

    constructor(
        private readonly transactionService: TransactionsService
    ) {}

    @Get('/transaction-status/:hash')
    public async statusTransaction(@Param('hash') hash: string, @Res() response: Response) {
        const data = await this.transactionService.statusTransaction(hash)
        return response.status(200).send(data)
    }

    @Get('/transaction-cache/:hash/:network')
    public async cacheTransaction(@Param('hash') hash: string, @Param('network') network: number, @Res() response: Response) {
        const data = await this.transactionService.cacheTransaction(hash, network)
        return response.status(200).send(data)
    }

    @Get('/vote-proposal/:hash/:network')
    public async voteProposal(@Param('hash') hash: string, @Param('network') network: number, @Res() response: Response) {
        const data = await this.transactionService.voteProposal(hash, network)
        return response.status(200).send(data)
    }

    @Get('/execute-proposal/:nonce')
    public async executeProposal(@Param('nonce') nonce: string, @Res() response: Response) {
        const data = await this.transactionService.executeProposal(nonce)
        return response.status(200).send(data)
    }

}
