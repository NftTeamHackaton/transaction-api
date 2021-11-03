import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import {ChainId, Fetcher, Pair, Route, Trade, TokenAmount, TradeType, Percent, JSBI} from '@pancakeswap/sdk'
import { PancakeTokenBuilder } from './tokens/pancakeToken.builder';

@Injectable()
export class PancakeswapService {
    constructor(private readonly tokenBuilder: PancakeTokenBuilder) {}

    public async calculatePrice (network: string, tokenInputSymbol: string, tokenOutputSymbol: string, amount: string) {
        try {
            const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org")
            const chainID = ChainId[network.toUpperCase()]
            const tokenInput = this.tokenBuilder.build(chainID, tokenInputSymbol)
            const tokenOutput = this.tokenBuilder.build(chainID, tokenOutputSymbol)
            const tokenInputAmount = new TokenAmount(tokenInput, amount)
            const pair = await Fetcher.fetchPairData(tokenInput, tokenOutput, provider)
            const route = new Route([pair], tokenInput);
            const trade = new Trade(route, tokenInputAmount, TradeType.EXACT_INPUT);
            const slippageTolerance = new Percent('50', '10000');
            const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
            const amountOutMax = trade.maximumAmountIn(slippageTolerance).raw;

            

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
