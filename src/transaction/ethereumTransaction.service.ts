import { HttpService, Injectable, Logger, Post } from '@nestjs/common';
import Compound from '@compound-finance/compound-js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from 'src/config/config.service';
import { Erc20TransactionEntity } from 'src/entities/erc20Transaction.entity';
import { AaveTokenBuilder } from 'src/aave/aaveToken.builder';
import { ChainId } from '@uniswap/sdk';
import { UniswapTokenBuilder } from 'src/uniswap/tokens/uniswapToken.builder';
@Injectable()
export class EthereumTransactionService {
    private readonly logger = new Logger(EthereumTransactionService.name);

    constructor(
        @InjectRepository(Erc20TransactionEntity)
        private readonly erc20TransactionRepository: Repository<Erc20TransactionEntity>,
        private readonly configService: ConfigService,
        private readonly aaveTokenBuilder: AaveTokenBuilder,
        private readonly uniswapTokenBuilder: UniswapTokenBuilder,
        private readonly httpService: HttpService
    ) {}
    
    public async newTxInCompound(network: string, erc20Symbol: string, сTokenSymbol: string, address: string, opeartion: string) {
        const contractAddress = Compound.util.getAddress(erc20Symbol, network.toLowerCase())
        const cTokenContractAddress = Compound.util.getAddress(сTokenSymbol, network.toLowerCase())
        this.logger.debug(network)
        this.logger.debug(erc20Symbol)
        this.logger.debug(сTokenSymbol)
        this.logger.debug(address)
        this.logger.debug(opeartion)
        this.logger.debug(contractAddress)
        this.logger.debug(cTokenContractAddress)
        if(contractAddress != undefined && cTokenContractAddress != undefined) {
            await this.transactionErc20Cache(network, contractAddress, address, opeartion)
            return this.fetchCompoundTransaction(contractAddress, cTokenContractAddress, address)
        }
        return []
    }

    public async getAllEthereumTransactionList(network: string, address: string) {
        const cachedTxCount = await this.erc20TransactionRepository.count({where: [
            {contractAddress: '', from: address}, {contractAddress: '', to: address}
        ]})
        if(cachedTxCount <= 0) {
            await this.transactionEthCache(network, address, '')
        }
        return this.fetchEthereumTransactionList(network, 'ETH', address)
    }

    public async getAllERC20TransactionList(network: string, contractAddress: string, address: string) {
        const cachedTxCount = await this.erc20TransactionRepository.count({where: [
            {contractAddress: '', from: address}, {contractAddress: '', to: address}
        ]})
        if(cachedTxCount <= 0) {
            await this.transactionErc20Cache(network, contractAddress, address, '')
        }
        return this.fetchERC20TransactionList(network, contractAddress, address)
    }

    public async getAllCompoundTransaction(network: string, erc20Symbol: string, address: string, operation?: string) {
        const contractAddress = Compound.util.getAddress(erc20Symbol, network).toLowerCase()
        const cTokenContractAddress = Compound.util.getAddress('c' + erc20Symbol, network).toLowerCase()
        const cachedTxCount = await this.erc20TransactionRepository.count({where: [
            {from: address}, {to: address}
        ]})

        if(cachedTxCount <= 0) {
            await this.transactionErc20Cache(network, contractAddress, address, operation)
        }
        return this.fetchCompoundTransaction(contractAddress, cTokenContractAddress, address)
    }

    public async newTxInAave(network: string, erc20Symbol: string, address: string, operation: string) {
        const tokenData: IToken = this.aaveTokenBuilder.build(ChainId[network], erc20Symbol)
        await this.transactionErc20Cache(network, tokenData.address, address, operation)
        return this.fetchAaveTransaction(tokenData.address.toLowerCase(), tokenData.aTokenAddress.toLowerCase(), address)
    }

    public async getAllAaveTransaction(network: string, erc20Symbol: string, address: string, operation?: string) {
        const tokenData: IToken = this.aaveTokenBuilder.build(ChainId[network], erc20Symbol)
        const cachedTxCount = await this.erc20TransactionRepository.count({where: [
            {from: address}, {to: address}
        ]})

        if(cachedTxCount <= 0) {
            await this.transactionErc20Cache(network, tokenData.address, address, operation)
        }

        return this.fetchAaveTransaction(tokenData.address.toLowerCase(), tokenData.aTokenAddress.toLowerCase(), address)
    }

    public async newTxInUniswap(network: string, token0: string, token1: string, address: string, operation: string) {
        const tokenFirst = this.uniswapTokenBuilder.build(ChainId[network], token0)
        const tokenSecond = this.uniswapTokenBuilder.build(ChainId[network], token1)

        if(tokenFirst.symbol != 'WETH') {
            await this.transactionErc20Cache(network, tokenFirst.address, address, operation)
        }

        if(tokenSecond.symbol != 'WETH') {
            await this.transactionErc20Cache(network, tokenSecond.address, address, operation)
        }

        if(tokenFirst.symbol == 'WETH' || tokenSecond.symbol == 'WETH') {
            await this.transactionEthCache(network, address, operation)
        }
        
        return this.fetchUniswapTransaction(tokenFirst.symbol.toUpperCase(), tokenSecond.symbol.toUpperCase(), address)
    }

    public async getAllUniswapTransaction(network: string, token0: string, token1: string, address: string, operation?: string) {
        const tokenFirst = this.uniswapTokenBuilder.build(ChainId[network], token0)
        const tokenSecond = this.uniswapTokenBuilder.build(ChainId[network], token1)
        const cachedTxCount = await this.erc20TransactionRepository.count({where: [
            {from: address}, {to: address}
        ]})

        if(cachedTxCount <= 0) {
            await this.transactionErc20Cache(network, tokenFirst.address, address, operation)
            await this.transactionErc20Cache(network, tokenSecond.address, address, operation)
            await this.transactionEthCache(network, address, operation)
        }
    

        return this.fetchUniswapTransaction(tokenFirst.symbol.toUpperCase(), tokenSecond.symbol.toUpperCase(), address)
    }

    private async transactionErc20Cache(network: string, contractAddress: string, address: string, operation?: string): Promise<void> {
        if(operation == undefined) {
            operation = ''
        }
        const transactions = await this.httpService.get('/api', {
            params: {
                module: 'account',
                action: 'tokentx',
                contractaddress: contractAddress,
                address,
                page: 1,
                offset: 100,
                sort: 'desc',
                apikey: this.configService.getEtherscanApiKey()
            }
        }).toPromise()
        const data: Erc20TransactionInterface[] = transactions.data.result;
        console.log(data)
        for (let i = 0; i < data.length; i++) {
            const tx: Erc20TransactionInterface = data[i]

            const savedTx = await this.erc20TransactionRepository.findOne({hash: tx.hash});
            if(savedTx == undefined) {
                await this.erc20TransactionRepository.save({
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

    private async transactionEthCache(network: string, address: string, operation?: string): Promise<void> {
        if(operation == undefined) {
            operation = ''
        }
        const transactions = await this.httpService.get('/api', {
            params: {
                module: 'account',
                action: 'txlist',
                address,
                startblock: 0,
                endblock: 99999999,
                page: 1,
                offset: 100,
                sort: 'desc',
                apikey: this.configService.getEtherscanApiKey()
            }
        }).toPromise()
        const data: EthereumTransactionInterface[] = transactions.data.result;
        for (let i = 0; i < data.length; i++) {
            const tx: EthereumTransactionInterface = data[i]

            const savedTx = await this.erc20TransactionRepository.findOne({hash: tx.hash});
            if(savedTx == undefined) {
                await this.erc20TransactionRepository.save({
                    blockNumber: tx.blockNumber,
                    timeStamp: tx.timeStamp,
                    hash: tx.hash,
                    nonce: Number(tx.nonce),
                    blockHash: tx.blockHash,
                    from: tx.from,
                    contractAddress: '',
                    to: tx.to,
                    value: tx.value,
                    tokenName: 'Ethereum',
                    tokenSymbol: 'ETH',
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

    private async fetchEthereumTransactionList(network: string, tokenSymbol: string, address: string) {
        return this.erc20TransactionRepository.find({where: [
            {tokenSymbol, from: address},
            {tokenSymbol, to: address},
        ]})
    }

    private async fetchERC20TransactionList(network: string, contractAddress: string, address: string) {
        return this.erc20TransactionRepository.find({where: [
            {contractAddress, from: address},
            {contractAddress, to: address},
        ]})
    }

    private async fetchUniswapTransaction(token0Symbol: string, token1Symbol: string, address: string) {
        
        if(token0Symbol == 'WETH') {
            token0Symbol = 'ETH'
        }

        if(token1Symbol == 'WETH') {
            token1Symbol = 'ETH'
        }

        return this.erc20TransactionRepository.find({order: {nonce: 'DESC'}, where: [
            {tokenSymbol: token0Symbol, from: address, to: '0xcc1b14a6cEF311050eb3A8690F871F98d1F7c4B7'.toLowerCase()},
            {tokenSymbol: token0Symbol, from: '0xcc1b14a6cEF311050eb3A8690F871F98d1F7c4B7'.toLowerCase(), to: address},

            {tokenSymbol: token1Symbol, from: address, to: '0xcc1b14a6cEF311050eb3A8690F871F98d1F7c4B7'.toLowerCase()},
            {tokenSymbol: token1Symbol, from: '0xcc1b14a6cEF311050eb3A8690F871F98d1F7c4B7'.toLowerCase(), to: address},

            {tokenSymbol: token0Symbol, from: address, to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'.toLowerCase()},
            {tokenSymbol: token0Symbol, from: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'.toLowerCase(), to: address},

            {tokenSymbol: token1Symbol, from: address, to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'.toLowerCase()},
            {tokenSymbol: token1Symbol, from: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'.toLowerCase(), to: address},

            {tokenSymbol: token1Symbol, from: address, to: '0xd1106dB81792a47DBb702Ad714ca63eF83463309'.toLowerCase()},
            {tokenSymbol: token1Symbol, from: '0xd1106dB81792a47DBb702Ad714ca63eF83463309'.toLowerCase(), to: address},

            {tokenSymbol: token0Symbol, from: address, to: '0xd1106dB81792a47DBb702Ad714ca63eF83463309'.toLowerCase()},
            {tokenSymbol: token0Symbol, from: '0xd1106dB81792a47DBb702Ad714ca63eF83463309'.toLowerCase(), to: address},
        ]})
    }

    private async fetchAaveTransaction(contractAddress: string, lendingPoolAddress: string, address: string) {
        return this.erc20TransactionRepository.find({where: [
            {contractAddress, from: address, to: '0x2a2c4c74eadb37a76fc1da7924c60fa466bad334'},
            {contractAddress, from: '0x2a2c4c74eadb37a76fc1da7924c60fa466bad334', to: address},

            {from: address, to: lendingPoolAddress},
            {from: lendingPoolAddress, to: address},
        ]})
    }

    private async fetchCompoundTransaction(contractAddress: string, cTokenContractAddress: string, address: string) {
        return this.erc20TransactionRepository.find({where: [
            {contractAddress, from: address, to: '0x031A512148DBFDB933E41F2f6824D737830595Be'.toLowerCase()},
            {contractAddress, from: '0x031A512148DBFDB933E41F2f6824D737830595Be'.toLowerCase(), to: address},

            {contractAddress, from: address, to: cTokenContractAddress},
            {contractAddress, from: cTokenContractAddress, to: address},
        ]})
    }
}
