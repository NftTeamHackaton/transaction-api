import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import {ChainId, Fetcher, CurrencyAmount, Route, Trade, TokenAmount, TradeType, Percent, JSBI, Price, Pair} from '@uniswap/sdk'
import { TokenBuilder } from './tokens/token.builder';

@Injectable()
export class UniswapService {
    constructor(private readonly tokenBuilder: TokenBuilder) {}

    public async userInfo(network: string, tokenInputSymbol: string, tokenOutputSymbol: string, accountAddress: string) {
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

        if(balanceOf.toSignificant(6) == 0) {
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