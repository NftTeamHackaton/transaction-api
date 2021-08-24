import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainId } from '@uniswap/sdk';
import { AaveInvest } from 'src/entities/aaveInvest.entity';
import { Repository } from 'typeorm';
import Web3 from 'web3'
import { aTokenABI } from './aToken.abi';
import { AaveTokenBuilder } from './aaveToken.builder';
import { LendingPoolABI } from './lendingPool.abi';

@Injectable()
export class AaveService {

    constructor(
        @InjectRepository(AaveInvest)
        private readonly aaveRepository: Repository<AaveInvest>,

        private readonly tokenBuilder: AaveTokenBuilder
    ) {}

    public async apyInfo(network: string) {
        const RAY = 1e27
        let provider = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/0d8a073ce66b4854b3d7aae977591077"));
        const usdtToken: IToken = this.tokenBuilder.build(ChainId[network.toUpperCase()], 'USDT')
        const usdcToken: IToken = this.tokenBuilder.build(ChainId[network.toUpperCase()], 'USDC')

        const lendingPool = new provider.eth.Contract(LendingPoolABI, "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe")

        const usdtInfo = await lendingPool.methods.getReserveData(usdtToken.address).call()
        const usdcInfo = await lendingPool.methods.getReserveData(usdcToken.address).call()
        return {
            usdtAPY: (100 * Number(usdtInfo.currentLiquidityRate)/RAY).toFixed(2),
            usdcAPY: (100 * Number(usdcInfo.currentLiquidityRate)/RAY).toFixed(2)
        }
    }

    public async stakedData(network: string, address: string) {
        let provider = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/0d8a073ce66b4854b3d7aae977591077"));

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
        let provider = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/0d8a073ce66b4854b3d7aae977591077"));

        const tokenData: IToken = this.tokenBuilder.build(ChainId[network.toUpperCase()], erc20Symbol)

        const aToken = new provider.eth.Contract(aTokenABI, tokenData.aTokenAddress);
        const lendingPool = new provider.eth.Contract(LendingPoolABI, "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe")
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

            if(aaveStaked.stakedBalance <= 0) {
                aaveStaked.stakedBalance = formattedBalance
                await this.aaveRepository.save(aaveStaked)
            }

            if(formattedBalance <= 0) {
                aaveStaked.stakedBalance = 0
                aaveStaked.reward = 0
                await this.aaveRepository.save(aaveStaked)
            }

            if(formattedBalance < aaveStaked.stakedBalance) {
                aaveStaked.stakedBalance = formattedBalance
                await this.aaveRepository.save(aaveStaked)
            }
            console.log(formattedBalance)
            console.log(aaveStaked.stakedBalance)
            console.log(percentDepositAPY)
            reward = (formattedBalance - aaveStaked.stakedBalance)
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
