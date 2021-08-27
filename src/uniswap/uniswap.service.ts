import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import {ChainId, Fetcher, CurrencyAmount, Route, Trade, TokenAmount, TradeType, Percent, JSBI, Price, Pair} from '@uniswap/sdk'
import { UniswapTokenBuilder } from './tokens/uniswapToken.builder';
import Web3 from 'web3'

@Injectable()
export class UniswapService {
    constructor(private readonly tokenBuilder: UniswapTokenBuilder) {}

    public async getTransaction(network: string, transactionHash: string) {
        let provider = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/0d8a073ce66b4854b3d7aae977591077"));
        let transaction = await provider.eth.getTransactionReceipt(transactionHash)
        for (let i = 0; i < transaction.logs.length; i++) {
            const log = transaction.logs[i]
            console.log(log.data)
        }
    }

    public async stakedInfo(network: string, address: string) {
        try {
            const chainID = ChainId[network.toUpperCase()]
            const pairEthAndUsdt = await Fetcher.fetchPairData(this.tokenBuilder.build(chainID, "WETH"), this.tokenBuilder.build(chainID, "USDT"))
            const pairEthAndUsdc = await Fetcher.fetchPairData(this.tokenBuilder.build(chainID, "WETH"), this.tokenBuilder.build(chainID, "USDC"))
            const pairEthAndWbtc = await Fetcher.fetchPairData(this.tokenBuilder.build(chainID, "WETH"), this.tokenBuilder.build(chainID, "WBTC"))
            const pairs = [pairEthAndUsdt, pairEthAndUsdc, pairEthAndWbtc]
            let provider = ethers.getDefaultProvider(network.toLowerCase(), {
                projectId: 'cf9ea9a288c245f3bb640e6a1bc8602a',
                projectSecret: '88d08fc8088b43f99c51be742196f41f'
            });
            let staked = []
            for(let i = 0; i < pairs.length; i++) {
                const pair = pairs[i]
                const pairContract = new ethers.Contract(
                    pairs[i].liquidityToken.address,
                    ['function totalSupply() external view returns (uint)', 'function balanceOf(address owner) external view returns (uint)'],
                    provider
                );
                let balanceOfContract = await pairContract.balanceOf(address)

                let totalSupply = await pairContract.totalSupply()
                totalSupply = new TokenAmount(pair.liquidityToken, totalSupply.toString())
                let balanceOf = new TokenAmount(pair.liquidityToken, balanceOfContract.toString())

                try {
                    const value0 = pair.getLiquidityValue(pair.token0, totalSupply, balanceOf)
                    const value1 = pair.getLiquidityValue(pair.token1, totalSupply, balanceOf)
                    const liquidityMinted = pair.getLiquidityMinted(totalSupply, value0, value1)
                    const shareOfPool = new Percent(liquidityMinted.raw, totalSupply.add(liquidityMinted).raw)
                    const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
                    
                    if(Number(balanceOfContract) > 0) {
                        console.log(`${pair.token0.symbol}-${pair.token1.symbol}`)
                        staked.push({
                            pair: `${pair.token0.symbol}-${pair.token1.symbol}`,
                            staked: true,
                            shareOfPool: shareOfPool?.lessThan(ONE_BIPS) ? '<0.01' : shareOfPool?.toFixed(2) ?? '0'
                        })
                    } else {
                        console.log(`${pair.token0.symbol}-${pair.token1.symbol}`)
                        staked.push({
                            pair: `${pair.token0.symbol}-${pair.token1.symbol}`,
                            staked: false,
                            shareOfPool: shareOfPool?.lessThan(ONE_BIPS) ? '<0.01' : shareOfPool?.toFixed(2) ?? '0'
                        })
                    }
                } catch (e) {
                    staked.push({
                        pair: `${pair.token0.symbol}-${pair.token1.symbol}`,
                        staked: false,
                        shareOfPool: '0'
                    })
                }
                
            }
            return staked;            

        } catch (error) {
            console.log(error)
            return []
        }
    }

    public async userInfo(network: string, tokenInputSymbol: string, tokenOutputSymbol: string, accountAddress: string) {
        try {
            const chainID = ChainId[network.toUpperCase()]
            const tokenInput = this.tokenBuilder.build(chainID, tokenInputSymbol)
            const tokenOutput = this.tokenBuilder.build(chainID, tokenOutputSymbol)
            const pair = await Fetcher.fetchPairData(tokenInput, tokenOutput)
            let provider = ethers.getDefaultProvider(network.toLowerCase(), {
                projectId: 'cf9ea9a288c245f3bb640e6a1bc8602a',
                projectSecret: '88d08fc8088b43f99c51be742196f41f'
            });
            const pairContract = new ethers.Contract(
                pair.liquidityToken.address,
                ['function totalSupply() external view returns (uint)', 'function balanceOf(address owner) external view returns (uint)'],
                provider
            );
            let totalSupply = await pairContract.totalSupply()
            let balanceOf = await pairContract.balanceOf(accountAddress)
            totalSupply = new TokenAmount(pair.liquidityToken, totalSupply.toString())
            balanceOf = new TokenAmount(pair.liquidityToken, balanceOf.toString())

            const value0 = pair.getLiquidityValue(tokenInput, totalSupply, balanceOf)
            const value1 = pair.getLiquidityValue(tokenOutput, totalSupply, balanceOf)
            const liquidityMinted = pair.getLiquidityMinted(totalSupply, value0, value1)
            const shareOfPool = new Percent(liquidityMinted.raw, totalSupply.add(liquidityMinted).raw)
            const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
            return {
                lpTokens: String(balanceOf.raw),
                lpTokensFormatted: String(balanceOf.toSignificant(6)),
                value0: String(value0.raw),
                value1: String(value1.raw),
                value0Formatted: String(value0.toSignificant(6)),
                value1Formatted: String(value1.toSignificant(6)),
                shareOfPool: shareOfPool?.lessThan(ONE_BIPS) ? '<0.01' : shareOfPool?.toFixed(2) ?? '0'
            }
        } catch (error) {
            console.log(error)
            return {
                lpTokens: "0",
                lpTokensFormatted: "0",
                value0: "0",
                value1: "0",
                value0Formatted: "0",
                value1Formatted: "0",
                shareOfPool: "0"
            }
        }
    }

    public async calculatePrice (network: string, tokenInputSymbol: string, tokenOutputSymbol: string, amount: string) {
        try {
            const chainID = ChainId[network.toUpperCase()]
            const tokenInput = this.tokenBuilder.build(chainID, tokenInputSymbol)
            const tokenOutput = this.tokenBuilder.build(chainID, tokenOutputSymbol)
            const tokenInputAmount = new TokenAmount(tokenInput, amount)
            const pair = await Fetcher.fetchPairData(tokenInput, tokenOutput)
            const route = new Route([pair], tokenInput);
            const trade = new Trade(route, tokenInputAmount, TradeType.EXACT_INPUT);
            const slippageTolerance = new Percent('50', '10000');
            const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
            const amountOutMax = trade.maximumAmountIn(slippageTolerance).raw;
            let provider = ethers.getDefaultProvider(network.toLowerCase(), {
                projectId: 'cf9ea9a288c245f3bb640e6a1bc8602a',
                projectSecret: '88d08fc8088b43f99c51be742196f41f'
            });
            const pairContract = new ethers.Contract(
                pair.liquidityToken.address,
                ['function totalSupply() external view returns (uint)'],
                provider
            );
            const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
            let totalSupply = await pairContract.totalSupply()
            totalSupply = new TokenAmount(pair.liquidityToken, totalSupply.toString())
            const tokenAmountA = tokenInputAmount
            const tokenAmountB = new TokenAmount(tokenOutput, String(trade.inputAmount.raw))
            const liquidityMinted = pair.getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB)
            const shareOfPool = new Percent(liquidityMinted.raw, totalSupply.add(liquidityMinted).raw)
            return {
                pairAddress: Pair.getAddress(tokenInput, tokenOutput),
                trade: {
                    outputAmount: String(trade.outputAmount.raw),

                    outputAmountFormatted: String(trade.outputAmount.toSignificant(6)),
                    outputAmountInvertFormatted: String(trade.outputAmount.invert().toSignificant(6)),

                    inputAmount: String(trade.inputAmount.raw),

                    amountOutMin: String(amountOutMin),
                    amountOutMax: String(amountOutMax),

                    executionPrice: trade.executionPrice.toSignificant(6),
                    nextMidPrice: trade.nextMidPrice.toSignificant(6),
                },
                liqudity: {
                    midPrice: route.midPrice.toSignificant(6),
                    midPriceInvert: route.midPrice.invert().toSignificant(6),
                    outputAmount: String(pair.priceOf(tokenInput).quote(tokenInputAmount).raw),
                    outputAmountFormatted: pair.priceOf(tokenInput).quote(tokenInputAmount).toSignificant(6),
                    shareOfPool: shareOfPool?.lessThan(ONE_BIPS) ? '<0.01' : shareOfPool?.toFixed(2) ?? '0'
                },
                input: route.input,
                output: route.output
            }
        } catch (error) {
            console.log(error)
        }
    }
}