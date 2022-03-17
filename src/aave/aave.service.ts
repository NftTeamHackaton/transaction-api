import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainId } from '@uniswap/sdk';
import { AaveInvest } from 'src/entities/aaveInvest.entity';
import { Repository } from 'typeorm';
import Web3 from 'web3'
import { aTokenABI } from './aToken.abi';
import { AaveTokenBuilder } from './aaveToken.builder';
import { LendingPoolABI } from './lendingPool.abi';
import { ConfigService } from 'src/config/config.service';
import { INKA_AAVE_PROVIDER } from './inkaAaveProvider.abi';
import { DepositEncodeAave } from './depositEncodeAave.dto';
import { WithdrawEncodeAave } from './withdrawEncodeAave.dto';

@Injectable()
export class AaveService {

    constructor(
        @InjectRepository(AaveInvest)
        private readonly aaveRepository: Repository<AaveInvest>,
        private readonly tokenBuilder: AaveTokenBuilder,
        private readonly configService: ConfigService
    ) {}

    public async depositEncodeFunction(depositEncodeDto: DepositEncodeAave) {
        let provider = new Web3(new Web3.providers.HttpProvider(this.configService.getInfuraURL('kovan')));
        const contract = new provider.eth.Contract(INKA_AAVE_PROVIDER)
        return contract.methods.deposit(depositEncodeDto.asset, depositEncodeDto.amount, depositEncodeDto.onBehalfOf, depositEncodeDto.referralCode).encodeABI()
    }

    public async withdrawEncodeFunction(withdrawEncodeDto: WithdrawEncodeAave) {
        let provider = new Web3(new Web3.providers.HttpProvider(this.configService.getInfuraURL('kovan')));
        const contract = new provider.eth.Contract(LendingPoolABI)
        return contract.methods.withdraw(withdrawEncodeDto.asset, withdrawEncodeDto.amount, withdrawEncodeDto.to).encodeABI()
    }

    public async apyInfo(network: string) {
        const RAY = 1e27
        let provider = new Web3(new Web3.providers.HttpProvider(this.configService.getInfuraURL(network)));
        const usdtToken: IToken = this.tokenBuilder.build(ChainId[network.toUpperCase()], 'USDT')
        const usdcToken: IToken = this.tokenBuilder.build(ChainId[network.toUpperCase()], 'USDC')

        const lendingPool = new provider.eth.Contract(LendingPoolABI, this.configService.getAaveLendingPoolAddress(network))

        const usdtInfo = await lendingPool.methods.getReserveData(usdtToken.address).call()
        const usdcInfo = await lendingPool.methods.getReserveData(usdcToken.address).call()
        return {
            usdtAPY: (100 * Number(usdtInfo.currentLiquidityRate)/RAY).toFixed(2),
            usdcAPY: (100 * Number(usdcInfo.currentLiquidityRate)/RAY).toFixed(2)
        }
    }

    public async stakedData(network: string, address: string) {
        let provider = new Web3(new Web3.providers.HttpProvider(this.configService.getInfuraURL(network)));

        const usdtToken: IToken = this.tokenBuilder.build(ChainId[network.toUpperCase()], 'USDT')
        const usdcToken: IToken = this.tokenBuilder.build(ChainId[network.toUpperCase()], 'USDC')
        const aTokenUSDT = new provider.eth.Contract(aTokenABI, usdtToken.aTokenAddress);
        const aTokenUSDC = new provider.eth.Contract(aTokenABI, usdcToken.aTokenAddress);
        const balanceOfUSDT = await aTokenUSDT.methods.balanceOf(address).call()
        const balanceOfUSDC = await aTokenUSDC.methods.balanceOf(address).call()
        return {
            usdtStaked: balanceOfUSDT > 0 ? true : false,
            usdcStaked: balanceOfUSDC > 0 ? true : false,
        }
    }

    public async getRewardData(network: string, erc20Symbol: string, address: string) {
        let provider = new Web3(new Web3.providers.HttpProvider(this.configService.getInfuraURL(network)));

        const tokenData: IToken = this.tokenBuilder.build(ChainId[network.toUpperCase()], erc20Symbol)

        const aToken = new provider.eth.Contract(aTokenABI, tokenData.aTokenAddress);
        const lendingPool = new provider.eth.Contract(LendingPoolABI, this.configService.getAaveLendingPoolAddress(network))
        const s = await lendingPool.methods.getReserveData(tokenData.address).call()
        const RAY = 1e27
        const percentDepositAPY = 100 * Number(s.currentLiquidityRate)/RAY
        const balanceOfAToken = await aToken.methods.balanceOf(address).call()
        const formattedBalance = (balanceOfAToken / Math.pow(10, tokenData.decimals))
        const aaveStaked = await this.aaveRepository.findOne({
            address: address.toLowerCase(), network, erc20TokenAddress: tokenData.address, aTokenAddress: tokenData.aTokenAddress
        })
        let reward = 0;
        let staked = 0;

        const depositLogs = await lendingPool.getPastEvents('Deposit', {
            filter: {'onBehalfOf': address},
            fromBlock: 190, toBlock: 'latest'
        })
        const withdrawLogs = await lendingPool.getPastEvents('Withdraw', {
            filter: {'user': address},
            fromBlock: 190, toBlock: 'latest'
        })
        let withdrawSum = 0
        let depositSum = 0
        withdrawLogs.map(function (event) {
            if(event.returnValues.reserve.toLowerCase() == tokenData.address.toLowerCase()) {
                withdrawSum += Number(event.returnValues.amount)
            }
        })

         depositLogs.map(function (event) {
            if(event.returnValues.reserve.toLowerCase() == tokenData.address.toLowerCase()) {
                depositSum += Number(event.returnValues.amount)
            }
        })
        if(depositSum >= withdrawSum) {
            staked = depositSum - withdrawSum
        } else {
            staked = withdrawSum - depositSum
        }
        
        staked = (staked / Math.pow(10, tokenData.decimals))

        

        if(aaveStaked == undefined) {
            await this.aaveRepository.save({
                address: address.toLowerCase(),
                stakedBalance: formattedBalance,
                reward: 0,
                erc20TokenAddress: tokenData.address,
                aTokenAddress: tokenData.aTokenAddress,
                network: network,
                stakingDate: new Date(),
                rewardDate: new Date()
            })
            staked = formattedBalance
        } else {
            aaveStaked.stakedBalance = formattedBalance

            reward = (staked - aaveStaked.stakedBalance)
            staked = aaveStaked.stakedBalance
            if(reward < 0) 
                reward = 0;
        }
        return {
            APY: percentDepositAPY.toFixed(2),
            reward: reward.toFixed(8), 
            staked: Number(staked).toFixed(8), 
            total: formattedBalance.toFixed(8)
        }
    }
}
