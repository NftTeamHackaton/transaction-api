import { HttpService, Injectable, Logger, Post } from '@nestjs/common';
import Compound from '@compound-finance/compound-js';
import Web3 from 'web3'
import { ERC20ABI } from './erc20.abi';
import { cTokenABI } from './cToken.abi';
import { Repository } from 'typeorm';
import { Compound as CompoundEntity } from 'src/entities/compount.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { StakingDto } from './staking.dto';
import { ConfigService } from 'src/config/config.service';
import { Erc20TransactionEntity } from 'src/entities/erc20Transaction.entity';
const ethers = require('ethers');

@Injectable()
export class CompoundService {
    private readonly logger = new Logger(CompoundService.name);

    constructor(
        @InjectRepository(CompoundEntity)
        private readonly compoundRepository: Repository<CompoundEntity>,
        @InjectRepository(Erc20TransactionEntity)
        private readonly erc20TransactionRepository: Repository<Erc20TransactionEntity>,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {}

    private async cacheTransactionHistory(network: string, contractAddress: string, address: string): Promise<void> {
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

    public async stakedBalance(network: string, address: string) {
        let provider = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/0d8a073ce66b4854b3d7aae977591077"));
        const cTokenUSDT = new provider.eth.Contract(cTokenABI, Compound.util.getAddress('cUSDT', network.toLowerCase()));
        const cTokenUSDC = new provider.eth.Contract(cTokenABI, Compound.util.getAddress('cUSDC', network.toLowerCase()));
        const cTokenDAI = new provider.eth.Contract(cTokenABI, Compound.util.getAddress('cDAI', network.toLowerCase()));
        const cTokenUSDTBalance = await cTokenUSDT.methods.balanceOf(address).call();
        const cTokenUSDCBalance = await cTokenUSDC.methods.balanceOf(address).call();
        const cTokenDAIBalance = await cTokenDAI.methods.balanceOf(address).call();
        return {
            usdtStaked: cTokenUSDTBalance > 0 ? true : false,
            usdcStaked: cTokenUSDCBalance > 0 ? true : false,
            daiStaked: cTokenDAIBalance > 0 ? true : false
        }
    }

    public async staking(network: string, stakingDto: StakingDto) {
        let provider = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/0d8a073ce66b4854b3d7aae977591077"));
        const erc20TokenAddress = Compound.util.getAddress(stakingDto.erc20Symbol, network.toLowerCase())
        const cTokenAddress = Compound.util.getAddress(stakingDto.cTokenSymbol, network.toLowerCase())
        const underlying = new provider.eth.Contract(ERC20ABI, erc20TokenAddress);
        const cToken = new provider.eth.Contract(cTokenABI, cTokenAddress);
        const cTokenDecimals = 8;
        const underlyingDecimals = await underlying.methods.decimals().call();
        const exchangeRateCurrent = await cToken.methods.exchangeRateCurrent().call();
        const mantissa = 18 + parseInt(underlyingDecimals) - cTokenDecimals;
        const oneCTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);
        const cTokenBalance = await cToken.methods.balanceOf(stakingDto.address).call();
        const underlyingBalance = (cTokenBalance / Math.pow(10, cTokenDecimals)) * oneCTokenInUnderlying
        await this.compoundRepository.save({
            address: stakingDto.address.toLowerCase(),
            stakedBalance: underlyingBalance,
            reward: 0,
            erc20TokenAddress: erc20TokenAddress,
            cTokenAddress: cTokenAddress,
            network: network,
            stakingDate: new Date(),
            rewardDate: new Date()
        })

        return {
            staking: underlyingBalance,
            reward: 0
        }
    }

    public async getCompData(network: string, address: string) {
        const balance = await Compound.comp.getCompBalance(address, 'https://kovan.infura.io/v3/0d8a073ce66b4854b3d7aae977591077');
        const accrued = await Compound.comp.getCompAccrued(address, 'https://kovan.infura.io/v3/0d8a073ce66b4854b3d7aae977591077');
        return {
            balance, accrued
        }
    }

    public async getRewardData(network: string, erc20Symbol: string, cTokenSymbol: string, address: string) {
        let provider = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/0d8a073ce66b4854b3d7aae977591077"));
        const erc20TokenAddress = Compound.util.getAddress(erc20Symbol, network)
        const cTokenAddress = Compound.util.getAddress(cTokenSymbol, network)
        const underlying = new provider.eth.Contract(ERC20ABI, erc20TokenAddress);
        const cToken = new provider.eth.Contract(cTokenABI, cTokenAddress);

        const cTokenDecimals = 8;
        const underlyingDecimals = await underlying.methods.decimals().call();
        const exchangeRateCurrent = await cToken.methods.exchangeRateCurrent().call();
        const mantissa = 18 + parseInt(underlyingDecimals) - cTokenDecimals;
        const oneCTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);
        const cTokenBalance = await cToken.methods.balanceOf(address).call();
        const underlyingBalance = (cTokenBalance / Math.pow(10, cTokenDecimals)) * oneCTokenInUnderlying
        const compoundStaked = await this.compoundRepository.findOne({
            address: address.toLowerCase(), network, erc20TokenAddress, cTokenAddress
        })
        let reward = 0;
        let staked = 0;
        if(compoundStaked == undefined) {
            await this.compoundRepository.save({
                address: address.toLowerCase(),
                stakedBalance: underlyingBalance,
                reward: 0,
                erc20TokenAddress: erc20TokenAddress,
                cTokenAddress: cTokenAddress,
                network: network,
                stakingDate: new Date(),
                rewardDate: new Date()
            })
            staked = underlyingBalance
        } else {
            const stakedBefore = compoundStaked.stakedBalance

            if(underlyingBalance <= 0) {
                compoundStaked.stakedBalance = 0
                compoundStaked.reward = 0
                await this.compoundRepository.save(compoundStaked)
            }
            
            reward = (underlyingBalance - stakedBefore)
            staked = stakedBefore
            if(reward < 0) 
                reward = 0;
        }
        return {
            reward: reward.toFixed(8), 
            staked: Number(staked).toFixed(8), 
            total: underlyingBalance.toFixed(8)
        }

    }
}
