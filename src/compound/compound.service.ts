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

    public async stakedBalance(network: string, address: string) {
        let provider = new Web3(new Web3.providers.HttpProvider(this.configService.getInfuraURL(network)));
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
        let provider = new Web3(new Web3.providers.HttpProvider(this.configService.getInfuraURL(network)));
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
        const balance = await Compound.comp.getCompBalance(address, this.configService.getInfuraURL(network));
        const accrued = await Compound.comp.getCompAccrued(address, this.configService.getInfuraURL(network));
        return {
            balance, accrued
        }
    }

    public async getRewardData(network: string, erc20Symbol: string, cTokenSymbol: string, address: string) {
        let provider = new Web3(new Web3.providers.HttpProvider(this.configService.getInfuraURL(network)));
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
        const mintLogs = await cToken.getPastEvents('Transfer', {
            filter: {'to': address},
            fromBlock: 190, toBlock: 'latest'
        })
        const reedemLogs = await cToken.getPastEvents('Transfer', {
            filter: {'from': address},
            fromBlock: 190, toBlock: 'latest'
        })
        let withdrawSum = 0
        let depositSum = 0
        mintLogs.map(function (event) {
            depositSum += Number(event.returnValues.amount)
        })
        reedemLogs.map(function (event) {
            withdrawSum += Number(event.returnValues.amount)
        })

        if(depositSum >= withdrawSum) {
            staked = depositSum - withdrawSum
        } else {
            staked = withdrawSum - depositSum
        }
        staked = (staked / Math.pow(10, cTokenDecimals)) * oneCTokenInUnderlying
        console.log(staked)

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
            if(compoundStaked.stakedBalance != staked) {
                compoundStaked.stakedBalance = staked
                await this.compoundRepository.save(compoundStaked)
            }
            reward = (underlyingBalance - compoundStaked.stakedBalance)
            staked = compoundStaked.stakedBalance
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
