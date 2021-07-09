import { HttpService, Injectable, Logger, Post } from '@nestjs/common';
import Compound from '@compound-finance/compound-js';
import Web3 from 'web3'
import { Repository } from 'typeorm';
import { Compound as CompoundEntity } from 'src/entities/compount.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from 'src/config/config.service';
import { Erc20TransactionEntity } from 'src/entities/erc20Transaction.entity';
import { TokenBuilder as AaveTokenBuild } from 'src/aave/token.builder';
import { ChainId } from '@uniswap/sdk';
import { TokenBuilder as UniswapTokenBuilder } from 'src/uniswap/tokens/token.builder';
@Injectable()
export class TransactionService {
    private readonly logger = new Logger(TransactionService.name);

    constructor(
        @InjectRepository(Erc20TransactionEntity)
        private readonly erc20TransactionRepository: Repository<Erc20TransactionEntity>,
        private readonly configService: ConfigService,
        private readonly aaveTokenBuilder: AaveTokenBuild,
        private readonly uniswapTokenBuilder: UniswapTokenBuilder,
        private readonly httpService: HttpService
    ) {}

    private async transactionErc20Cache(network: string, contractAddress: string, address: string): Promise<void> {
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
                    network
                })
            }
        }
    }

    private async transactionEthCache(network: string, address: string): Promise<void> {

    }

    public async newTxInCompound(network: string, erc20Symbol: string, сTokenSymbol: string, address: string) {        
        const contractAddress = Compound.util.getAddress(erc20Symbol, network.toLowerCase()).toLowerCase()
        const cTokenContractAddress = Compound.util.getAddress(сTokenSymbol, network.toLowerCase()).toLowerCase()
        await this.transactionErc20Cache(network, contractAddress, address)
        return this.fetchCompoundTransaction(contractAddress, cTokenContractAddress, address)
    }

    public async getAllCompoundTransaction(network: string, erc20Symbol: string, address: string) {
        const contractAddress = Compound.util.getAddress(erc20Symbol, network).toLowerCase()
        const cTokenContractAddress = Compound.util.getAddress('c' + erc20Symbol, network).toLowerCase()
        return this.fetchCompoundTransaction(contractAddress, cTokenContractAddress, address)
    }

    public async newTxInAave(network: string, erc20Symbol: string, address: string) {
        const tokenData: IToken = this.aaveTokenBuilder.build(ChainId[network], erc20Symbol)
        await this.transactionErc20Cache(network, tokenData.address, address)
        return this.fetchAaveTransaction(tokenData.address.toLowerCase(), tokenData.aTokenAddress.toLowerCase(), address)
    }

    public async getAllAaveTransaction(network: string, erc20Symbol: string, address: string) {
        const tokenData: IToken = this.aaveTokenBuilder.build(ChainId[network], erc20Symbol)
        return this.fetchAaveTransaction(tokenData.address.toLowerCase(), tokenData.aTokenAddress.toLowerCase(), address)
    }

    public async newTxInUniswap(network: string, token0: string, token1: string, address: string) {
        const tokenFirst = this.uniswapTokenBuilder.build(ChainId[network], token0)
        const tokenSecond = this.uniswapTokenBuilder.build(ChainId[network], token1)
        await this.transactionErc20Cache(network, tokenFirst.address, address)
        await this.transactionErc20Cache(network, tokenSecond.address, address)
        return this.fetchUniswapTransaction(tokenFirst.address.toLowerCase(), tokenSecond.address.toLowerCase(), address)
    }

    public async getAllUniswapTransaction(network: string, token0: string, token1: string, address: string) {
        const tokenFirst = this.uniswapTokenBuilder.build(ChainId[network], token0)
        const tokenSecond = this.uniswapTokenBuilder.build(ChainId[network], token1)
        return this.fetchUniswapTransaction(tokenFirst.address.toLowerCase(), tokenSecond.address.toLowerCase(), address)
    }

    private async fetchUniswapTransaction(token0Address: string, token1Address: string, address: string) {
        return this.erc20TransactionRepository.find({where: [
            {contractAddress: token0Address, from: address, to: '0xcc1b14a6cEF311050eb3A8690F871F98d1F7c4B7'.toLowerCase()},
            {contractAddress: token1Address, from: '0xcc1b14a6cEF311050eb3A8690F871F98d1F7c4B7'.toLowerCase(), to: address},

            {contractAddress: token0Address, from: address, to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'.toLowerCase()},
            {contractAddress: token1Address, from: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'.toLowerCase(), to: address},
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
