import { Injectable } from '@nestjs/common'
import {ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent, Token} from '@uniswap/sdk'

@Injectable()
export class UniswapTokenBuilder {
    readonly TOKENS = {
        USDC: {
            1: {
                decimals: 6,
                symbol: 'USDC',
                address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                name: 'USD Coin (USDC)'
            },
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
            1: {
                decimals: 6,
                symbol: 'USDT',
                address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
                name: 'Compound USDT (USDT)'
            },
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
            1: {
                decimals: 8,
                symbol: 'WBTC',
                address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
                name: 'Wrapped BTC (WBTC)'
            },
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
            1: {
                decimals: 18,
                symbol: 'DAI',
                address: '0x6b175474e89094c44da98b954eedeac495271d0f',
                name: 'DAI Stablecoin'
            },
            42: {
                decimals: 18,
                symbol: 'DAI',
                address: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
                name: 'DAI Stablecoin'
            }
        },
        BAT: {
            1: {
                decimals: 18,
                symbol: 'BAT',
                address: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
                name: 'Basic Attention Token'
            },
            42: {
                decimals: 18,
                symbol: 'BAT',
                address: '0x482dc9bb08111cb875109b075a40881e48ae02cd',
                name: 'Basic Attention Token'
            }
        },
        COMP: {
            1: {
                decimals: 18,
                symbol: 'COMP',
                address: '0xc00e94cb662c3520282e6f5717214004a7f26888',
                name: 'Compound'
            },
            42: {
                decimals: 18,
                symbol: 'COMP',
                address: '0x61460874a7196d6a22D1eE4922473664b3E95270',
                name: 'Compound'
            }
        }
    }
    

    public build(chainId: number, token: string): Token {
        const tokenFormat = token.toUpperCase()
        if(tokenFormat == 'WETH') {
            return WETH[chainId]
        }
        
        const tokenData = this.TOKENS[tokenFormat][chainId]
        return new Token(chainId, tokenData.address, tokenData.decimals, tokenData.symbol, tokenData.name)
    }
}