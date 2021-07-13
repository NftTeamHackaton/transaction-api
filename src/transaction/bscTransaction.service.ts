import { HttpService, Injectable, Logger, Post } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from 'src/config/config.service';
import { Bep20TransactionEntity } from 'src/entities/bep20Transaction.entity';
import { ChainId as ChainIdBSC } from '@pancakeswap/sdk';
import { TokenBuilder as PancakeSwapTokenBuild } from 'src/pancakeswap/tokens/token.builder';
@Injectable()
export class BscTransactionService {
    private readonly logger = new Logger(BscTransactionService.name);

    constructor(
        @InjectRepository(Bep20TransactionEntity)
        private readonly bep20TransactionRepository: Repository<Bep20TransactionEntity>,
        private readonly configService: ConfigService,
        private readonly pancakeSwapTokenBuilder: PancakeSwapTokenBuild,
        private readonly httpService: HttpService
    ) {}

    public async getAllBNBTransactionList(network: string, address: string) {
        const cachedTxCount = await this.bep20TransactionRepository.count({where: [
            {tokenSymbol: 'BNB', from: address}, {tokenSymbol: 'BNB', to: address}
        ]})
        if(cachedTxCount <= 0) {
            await this.transactionBNBCache(network, address, '')
        }
        return this.fetchBNBTransactionList(network, 'BNB', address)
    }

    private async fetchBNBTransactionList(network: string, tokenSymbol: string, address: string) {
        return this.bep20TransactionRepository.find({where: [
            {tokenSymbol, from: address},
            {tokenSymbol, to: address},
        ]})
    }

    public async getAllBEP20TransactionList(network: string, contractAddress: string, address: string) {
        const cachedTxCount = await this.bep20TransactionRepository.count({where: [
            {contractAddress: '', from: address}, {contractAddress: '', to: address}
        ]})
        if(cachedTxCount <= 0) {
            await this.transactionBEP20Cache(network, contractAddress, address, '')
        }
        return this.fetchBEP20TransactionList(network, contractAddress, address)
    }

    private async fetchBEP20TransactionList(network: string, contractAddress: string, address: string) {
        return this.bep20TransactionRepository.find({where: [
            {contractAddress, from: address},
            {contractAddress, to: address},
        ]})
    }


    public async getAllPancakeSwapTransaction(network: string, token0: string, token1: string, address: string) {
        const tokenFirst = this.pancakeSwapTokenBuilder.build(ChainIdBSC[network], token0)
        const tokenSecond = this.pancakeSwapTokenBuilder.build(ChainIdBSC[network], token1)
        const cachedTxCount = await this.bep20TransactionRepository.count({where: [
            {from: address},
            {to: address}
        ]})
        if(cachedTxCount <= 0) {
            await this.transactionBEP20Cache(network, tokenSecond.address, address, 'swap')
            await this.transactionBNBCache(network, address, 'swap')
        }
        return this.fetchPancakeSwapTransaction(tokenFirst.symbol.toUpperCase(), tokenSecond.symbol.toUpperCase(), address)
    }

    public async newTxInPancakeSwap(network: string, token0: string, token1: string, address: string, operation: string) {
        const tokenFirst = this.pancakeSwapTokenBuilder.build(ChainIdBSC[network], token0)
        const tokenSecond = this.pancakeSwapTokenBuilder.build(ChainIdBSC[network], token1)
        if(tokenFirst.symbol != 'WBNB') {
            await this.transactionBEP20Cache(network, tokenFirst.address, address, operation)
        }

        if(tokenSecond.symbol != 'WBNB') {
            await this.transactionBEP20Cache(network, tokenSecond.address, address, operation)
        }

        if(tokenFirst.symbol == 'WBNB' || tokenSecond.symbol == 'WBNB') {
            await this.transactionBNBCache(network, address, operation)
        }
        return this.fetchPancakeSwapTransaction(tokenFirst.symbol.toUpperCase(), tokenSecond.symbol.toUpperCase(), address)
    }

    private async transactionBEP20Cache(network: string, contractAddress: string, address: string, operation: string) {
        const transactions = await this.httpService.get('/api', {
            baseURL: 'https://api.bscscan.com',
            params: {
                module: 'account',
                action: 'tokentx',
                contractaddress: contractAddress,
                address,
                page: 1,
                offset: 100,
                sort: 'desc',
                apikey: this.configService.getSmartChainEtherscanApiKey()
            }
        }).toPromise()
        
        const data: Bep20TransactionInterface[] = transactions.data.result;
        for (let i = 0; i < data.length; i++) {
            const tx: Bep20TransactionInterface = data[i]
            const savedTx = await this.bep20TransactionRepository.findOne({hash: tx.hash});
            console.log(savedTx)
            if(savedTx == undefined) {
                await this.bep20TransactionRepository.save({
                    ...tx,
                    nonce: Number(tx.nonce),
                    tokenDecimals: Number(tx.tokenDecimal),
                    transactionDate: new Date(Number(tx.timeStamp) * 1000),
                    network,
                    operation
                })
            }
        }
    }

    private async transactionBNBCache(network: string, address: string, operation: string): Promise<void> {
        const transactions = await this.httpService.get('/api', {
            baseURL: 'https://api.bscscan.com',
            params: {
                module: 'account',
                action: 'txlist',
                address,
                startblock: 0,
                endblock: 99999999,
                page: 1,
                offset: 100,
                sort: 'desc',
                apikey: this.configService.getSmartChainEtherscanApiKey()
            }
        }).toPromise()
        const data: SmartChainTransactionInterface[] = transactions.data.result;
        for (let i = 0; i < data.length; i++) {
            const tx: SmartChainTransactionInterface = data[i]

            const savedTx = await this.bep20TransactionRepository.findOne({hash: tx.hash});
            if(savedTx == undefined) {
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
                    operation
                })
            }
        }
    }

    private async fetchPancakeSwapTransaction(token0Symbol: string, token1Symbol: string, address: string) {
        if(token0Symbol == 'WBNB') {
            token0Symbol = 'BNB'
        }

        if(token1Symbol == 'WBNB') {
            token1Symbol = 'BNB'
        }
        return this.bep20TransactionRepository.find({where: [
            {tokenSymbol: token1Symbol, from: address, to: '0x98Fe4bDD020fe387e746Cb53e01812055De592fc'.toLowerCase()},
            {tokenSymbol: token1Symbol, from: '0x98Fe4bDD020fe387e746Cb53e01812055De592fc'.toLowerCase(), to: address},

            {tokenSymbol: token1Symbol, from: address, to: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'.toLowerCase()},
            {tokenSymbol: token1Symbol, from: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'.toLowerCase(), to: address},

            {tokenSymbol: token1Symbol, from: address, to: '0x98Fe4bDD020fe387e746Cb53e01812055De592fc'.toLowerCase()},
            {tokenSymbol: token1Symbol, from: '0x98Fe4bDD020fe387e746Cb53e01812055De592fc'.toLowerCase(), to: address},

            {tokenSymbol: token1Symbol, from: address, to: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'.toLowerCase()},
            {tokenSymbol: token1Symbol, from: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'.toLowerCase(), to: address},

            {tokenSymbol: token1Symbol, from: address, to: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16'.toLowerCase()},
            {tokenSymbol: token1Symbol, from: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16'.toLowerCase(), to: address},
            {tokenSymbol: token0Symbol, from: address, to: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16'.toLowerCase()},
            {tokenSymbol: token0Symbol, from: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16'.toLowerCase(), to: address},

            {tokenSymbol: token0Symbol, from: address, to: '0x98Fe4bDD020fe387e746Cb53e01812055De592fc'.toLowerCase()},
            {tokenSymbol: token0Symbol, from: '0x98Fe4bDD020fe387e746Cb53e01812055De592fc'.toLowerCase(), to: address},

            {tokenSymbol: token0Symbol, from: address, to: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'.toLowerCase()},
            {tokenSymbol: token0Symbol, from: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'.toLowerCase(), to: address},

            {tokenSymbol: token0Symbol, from: address, to: '0x98Fe4bDD020fe387e746Cb53e01812055De592fc'.toLowerCase()},
            {tokenSymbol: token0Symbol, from: '0x98Fe4bDD020fe387e746Cb53e01812055De592fc'.toLowerCase(), to: address},

            {tokenSymbol: token0Symbol, from: address, to: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'.toLowerCase()},
            {tokenSymbol: token0Symbol, from: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'.toLowerCase(), to: address},
        ]})
    }
}