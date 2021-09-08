import { Injectable } from '@nestjs/common'
import {ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent, Token} from '@uniswap/sdk'

@Injectable()
export class AaveTokenBuilder {
    readonly TOKENS = {
        USDC: {
            1: {
                aTokenAddress: "0xBcca60bB61934080951369a648Fb03DF4F96263C",
                aTokenSymbol: "aUSDC",
                stableDebtTokenAddress: "0xE4922afAB0BbaDd8ab2a88E0C79d884Ad337fcA6",
                variableDebtTokenAddress: "0x619beb58998eD2278e08620f97007e1116D5D25b",
                symbol: "USDC",
                address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                decimals: 6
            },
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
            1: {
                aTokenAddress: "0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811",
                aTokenSymbol: "aUSDT",
                stableDebtTokenAddress: "0xe91D55AB2240594855aBd11b3faAE801Fd4c4687",
                variableDebtTokenAddress: "0x531842cEbbdD378f8ee36D171d6cC9C4fcf475Ec",
                symbol: "USDT",
                address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
                decimals: 6
            },
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
            1: {
                aTokenAddress: "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e",
                aTokenSymbol: "aWETH",
                stableDebtTokenAddress: "0x4e977830ba4bd783C0BB7F15d3e243f73FF57121",
                variableDebtTokenAddress: "0xF63B34710400CAd3e044cFfDcAb00a0f32E33eCf",
                symbol: "WETH",
                address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                decimals: 18
            },
            42: {
                aTokenAddress: '0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347',
                aTokenSymbol: 'aWETH',
                stableDebtTokenAddress: '0x1F85D0dc45332D00aead98D26db0735350F80D18',
                variableDebtTokenAddress: '0xDD13CE9DE795E7faCB6fEC90E346C7F3abe342E2',
                decimals: 18,
                symbol: 'WETH',
                address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C'
            }
        },
        DAI: {
            1: {
                aTokenAddress: "0x028171bCA77440897B824Ca71D1c56caC55b68A3",
                aTokenSymbol: "aDAI",
                stableDebtTokenAddress: "0x778A13D3eeb110A4f7bb6529F99c000119a08E92",
                variableDebtTokenAddress: "0x6C3c78838c761c6Ac7bE9F59fe808ea2A6E4379d",
                symbol: "DAI",
                address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
                decimals: 18
            },
            42: {
                aTokenAddress: "0xdCf0aF9e59C002FA3AA091a46196b37530FD48a8",
                aTokenSymbol: "aDAI",
                stableDebtTokenAddress: "0x3B91257Fe5CA63b4114ac41A0d467D25E2F747F3",
                variableDebtTokenAddress: "0xEAbBDBe7aaD7d5A278da40967E62C8c8Fe5fAec8",
                symbol: "DAI",
                address: "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD",
                decimals: 18
            }
        },
        GUSD: {
            1: {
                aTokenAddress: "0xD37EE7e4f452C6638c96536e68090De8cBcdb583",
                aTokenSymbol: "aGUSD",
                stableDebtTokenAddress: "0xf8aC64ec6Ff8E0028b37EB89772d21865321bCe0",
                variableDebtTokenAddress: "0x279AF5b99540c1A3A7E3CDd326e19659401eF99e",
                symbol: "GUSD",
                address: "0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd",
                decimals: 2
            },
            42: {

            }
        },
        CRV: {
            1: {
                aTokenAddress: "0x8dAE6Cb04688C62d939ed9B68d32Bc62e49970b1",
                aTokenSymbol: "aCRV",
                stableDebtTokenAddress: "0x9288059a74f589C919c7Cf1Db433251CdFEB874B",
                variableDebtTokenAddress: "0x00ad8eBF64F141f1C81e9f8f792d3d1631c6c684",
                symbol: "CRV",
                address: "0xD533a949740bb3306d119CC777fa900bA034cd52",
                decimals: 18
            },
            42: {

            }
        },
        SNX: {
            1: {
                aTokenAddress: "0x35f6B052C598d933D69A4EEC4D04c73A191fE6c2",
                aTokenSymbol: "aSNX",
                stableDebtTokenAddress: "0x8575c8ae70bDB71606A53AeA1c6789cB0fBF3166",
                variableDebtTokenAddress: "0x267EB8Cf715455517F9BD5834AeAE3CeA1EBdbD8",
                symbol: "SNX",
                address: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
                decimals: 18
            },
            42: {

            }
        }
    }
    

    public build(chainId: number, token: string): IToken {
        const tokenFormat = token.toUpperCase()
        const tokenData: IToken = this.TOKENS[tokenFormat][chainId]
        return tokenData
    }
}