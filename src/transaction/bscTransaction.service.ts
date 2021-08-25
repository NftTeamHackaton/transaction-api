import { HttpService, Injectable, Logger, Post } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from 'src/config/config.service';
import { Bep20TransactionEntity } from 'src/entities/bep20Transaction.entity';
import { ChainId as ChainIdBSC } from '@pancakeswap/sdk';
import { PancakeTokenBuilder } from 'src/pancakeswap/tokens/pancakeToken.builder';
@Injectable()
export class BscTransactionService {
    private readonly logger = new Logger(BscTransactionService.name);

    constructor(
        @InjectRepository(Bep20TransactionEntity)
        private readonly bep20TransactionRepository: Repository<Bep20TransactionEntity>,
        private readonly configService: ConfigService,
        private readonly pancakeSwapTokenBuilder: PancakeTokenBuilder,
        private readonly httpService: HttpService
    ) {}

    public async getAllBNBTransactionList(network: string, address: string) {
        await this.transactionBNBCache(network, address, '')
        return this.fetchBNBTransactionList(network, 'BNB', address)
    }

    private async fetchBNBTransactionList(network: string, tokenSymbol: string, address: string) {
        return this.bep20TransactionRepository.find({where: [
            {tokenSymbol, from: address},
            {tokenSymbol, to: address},
        ]})
    }

    public async getAllBEP20TransactionList(network: string, contractAddress: string, address: string) {
        await this.transactionBEP20Cache(network, contractAddress, address, '')
        return this.fetchBEP20TransactionList(network, contractAddress, address)
    }

    private async fetchBEP20TransactionList(network: string, contractAddress: string, address: string) {
        return this.bep20TransactionRepository.find({where: [
            {'LOWER(contractAddress)': contractAddress.toLowerCase(), from: address},
            {'LOWER(contractAddress)': contractAddress.toLowerCase(), to: address},
        ]})
    }


    public async getAllPancakeSwapTransaction(network: string, token0: string, token1: string, address: string) {
        const tokenFirst = this.pancakeSwapTokenBuilder.build(ChainIdBSC[network], token0)
        const tokenSecond = this.pancakeSwapTokenBuilder.build(ChainIdBSC[network], token1)
        return this.fetchPancakeSwapTransaction(tokenFirst.symbol.toUpperCase(), tokenSecond.symbol.toUpperCase(), address)
    }

    public async newTxInPancakeSwap(network: string, token0: string, token1: string, address: string, operation: string) {
        const tokenFirst = this.pancakeSwapTokenBuilder.build(ChainIdBSC[network], token0)
        const tokenSecond = this.pancakeSwapTokenBuilder.build(ChainIdBSC[network], token1)
        const pair = `${tokenFirst.symbol}-${tokenSecond.symbol}`
        await this.delay(20000)
        if(tokenFirst.symbol != 'WBNB') {
            await this.transactionBEP20Cache(network, tokenFirst.address, address, operation, pair, 'pancakeswap')
        }

        if(tokenSecond.symbol != 'WBNB') {
            await this.transactionBEP20Cache(network, tokenSecond.address, address, operation, pair, 'pancakeswap')
        }

        if(tokenFirst.symbol == 'WBNB' || tokenSecond.symbol == 'WBNB') {
            await this.transactionBNBCache(network, address, operation, pair, 'pancakeswap')
        }
        return this.fetchPancakeSwapTransaction(tokenFirst.symbol.toUpperCase(), tokenSecond.symbol.toUpperCase(), address)
    }

    private async transactionBEP20Cache(network: string, contractAddress: string, address: string, operation?: string, pair?: string, service?: string) {
        const transactions = await this.httpService.get('/api', {
            baseURL: 'https://api.bscscan.com',
            params: {
                module: 'account',
                action: 'tokentx',
                contractaddress: contractAddress,
                address,
                page: 1,
                offset: 1,
                sort: 'desc',
                apikey: this.configService.getSmartChainEtherscanApiKey()
            }
        }).toPromise()
        console.log(transactions.data.result)
        const data: Bep20TransactionInterface[] = transactions.data.result;
        console.log(data)
        for (let i = 0; i < data.length; i++) {
            const tx: Bep20TransactionInterface = data[i]
            const savedTx = await this.bep20TransactionRepository.findOne({hash: tx.hash});
            console.log(savedTx)
            if(savedTx == undefined) {
                await this.bep20TransactionRepository.save({
                    ...tx,
                    nonce: Number(tx.nonce),
                    contractAddress,
                    tokenDecimals: Number(tx.tokenDecimal),
                    transactionDate: new Date(Number(tx.timeStamp) * 1000),
                    network,
                    operation, pair, service
                })
            }
        }
    }

    private async transactionBNBCache(network: string, address: string, operation?: string, pair?: string, service?: string): Promise<void> {
        const transactions = await this.httpService.get('/api', {
            baseURL: 'https://api.bscscan.com',
            params: {
                module: 'account',
                action: 'txlist',
                address,
                startblock: 0,
                endblock: 99999999,
                page: 1,
                offset: 1,
                sort: 'desc',
                apikey: this.configService.getSmartChainEtherscanApiKey()
            }
        }).toPromise()
        console.log(transactions.data.result)
        const data: SmartChainTransactionInterface[] = transactions.data.result;
        for (let i = 0; i < data.length; i++) {
            const tx: SmartChainTransactionInterface = data[i]
            console.log('iteration')
            const savedTx = await this.bep20TransactionRepository.findOne({hash: tx.hash, tokenSymbol: 'BNB'});
            console.log(savedTx)
            if(savedTx instanceof Bep20TransactionEntity) {
                console.log(savedTx instanceof Bep20TransactionEntity)
                if(savedTx.tokenSymbol == 'BNB') {
                    console.log(savedTx.tokenSymbol == 'BNB')
                    continue;
                }

            }
            await this.bep20TransactionRepository.save({
                blockNumber: tx.blockNumber,
                timeStamp: tx.timeStamp,
                hash: tx.hash,
                nonce: Number(tx.nonce),
                blockHash: tx.blockHash,
                from: tx.from,
                contractAddress: '',
                to: tx.to,
                value: tx.value,
                tokenName: 'Binance Coin',
                tokenSymbol: 'BNB',
                tokenDecimals: 18,
                transactionIndex: tx.transactionIndex,
                gas: tx.gas,
                gasPrice: tx.gasPrice,
                gasUsed: tx.gasUsed,
                cumulativeGasUsed: tx.cumulativeGasUsed,
                input: tx.input,
                confirmations: tx.confirmations,
                transactionDate: new Date(Number(tx.timeStamp) * 1000),
                network,
                operation, pair, service
            })
        }
    }

    private async fetchPancakeSwapTransaction(token0Symbol: string, token1Symbol: string, address: string) {
        const pair = `${token0Symbol}-${token1Symbol}`

        return this.bep20TransactionRepository.find({order: {nonce: 'DESC'}, where: [
            {pair, from: address},
            {pair, to: address},
        ]})
    }

    private async delay(second) {
        return new Promise(res => setTimeout(res, second));
    }
}
