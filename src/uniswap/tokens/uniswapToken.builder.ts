import { Injectable } from '@nestjs/common'
import {ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent, Token} from '@uniswap/sdk'

@Injectable()
export class UniswapTokenBuilder {
    readonly TOKENS = {
        USDC: {
            1: {},
            4: {
                decimals: 6,
                symbol: 'USDC',
                address: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
                name: 'USD Coin (USDC)'
            },
            42: {
                decimals: 6,
                symbol: 'USDC',
                address: '0xb7a4f3e9097c08da09517b5ab877f7a917224ede',
                name: 'USD Coin (USDC)'
            }
        },
        USDT: {
            1: {},
            4: {
                decimals: 18,
                symbol: 'USDT',
                address: '0xd9ba894e0097f8cc2bbc9d24d308b98e36dc6d02',
                name: 'Compound USDT (USDT)'
            },
            42: {
                decimals: 6,
                symbol: 'USDT',
                address: '0x07de306ff27a2b630b1141956844eb1552b956b5',
                name: 'Compound USDT (USDT)'
            }
        },
        WBTC: {
            1: {},
            4: {
                decimals: 8,
                symbol: 'WBTC',
                address: '0x577d296678535e4903d59a4c929b718e1d575e0a',
                name: 'Wrapped BTC (WBTC)'
            },
            42: {
                decimals: 8,
                symbol: 'WBTC',
                address: '0xd3a691c852cdb01e281545a27064741f0b7f6825',
                name: 'Wrapped BTC (WBTC)'
            }
        },
        DAI: {
            42: {
                decimals: 18,
                symbol: 'DAI',
                address: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
                name: 'DAI Stablecoin'
            }
        },
        BAT: {
            42: {
                decimals: 18,
                symbol: 'BAT',
                address: '0x482dc9bb08111cb875109b075a40881e48ae02cd',
                name: 'Basic Attention Token'
            }
        },
        COMP: {
            42: {
                decimals: 18,
                symbol: 'COMP',
                address: '0x61460874a7196d6a22D1eE4922473664b3E95270',
                name: 'Compound'
            }
        }
    }
    

    public build(chainId: number, token: string): Token {
        console.log(chainId, token)
        const tokenFormat = token.toUpperCase()
        if(tokenFormat == 'WETH') {
            return WETH[chainId]
        }
        
        const tokenData = this.TOKENS[tokenFormat][chainId]
        return new Token(chainId, tokenData.address, tokenData.decimals, tokenData.symbol, tokenData.name)
    }
}