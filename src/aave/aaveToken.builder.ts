import { Injectable } from '@nestjs/common'
import {ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent, Token} from '@uniswap/sdk'

@Injectable()
export class AaveTokenBuilder {
    readonly TOKENS = {
        USDC: {
            1: {},
            42: {
                aTokenAddress: '0xe12AFeC5aa12Cf614678f9bFeeB98cA9Bb95b5B0',
                aTokenSymbol: 'aUSDC',
                stableDebtTokenAddress: '0x252C017036b144A812b53BC122d0E67cBB451aD4',
                variableDebtTokenAddress: '0xBE9B058a0f2840130372a81eBb3181dcE02BE957',
                decimals: 6,
                symbol: 'USDC',
                address: '0xe22da380ee6B445bb8273C81944ADEB6E8450422'
            }
        },
        USDT: {
            1: {},
            42: {
                aTokenAddress: '0xFF3c8bc103682FA918c954E84F5056aB4DD5189d',
                aTokenSymbol: 'aUSDT',
                stableDebtTokenAddress: '0xf3DCeaDf668607bFCF565E84d9644c42eea518cd',
                variableDebtTokenAddress: '0xa6EfAF3B1C6c8E2be44818dB64E4DEC7416983a1',
                decimals: 6,
                symbol: 'USDT',
                address: '0x13512979ADE267AB5100878E2e0f485B568328a4'
            }
        },
        WETH: {
            1: {},
            42: {
                aTokenAddress: '0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347',
                aTokenSymbol: 'aWETH',
                stableDebtTokenAddress: '0x1F85D0dc45332D00aead98D26db0735350F80D18',
                variableDebtTokenAddress: '0xDD13CE9DE795E7faCB6fEC90E346C7F3abe342E2',
                decimals: 18,
                symbol: 'WETH',
                address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C'
            }
        }
    }
    

    public build(chainId: number, token: string): IToken {
        const tokenFormat = token.toUpperCase()
        const tokenData: IToken = this.TOKENS[tokenFormat][chainId]
        return tokenData
    }
}