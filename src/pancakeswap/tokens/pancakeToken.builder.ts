import { Injectable } from '@nestjs/common'
import {ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent, Token} from '@pancakeswap/sdk'

@Injectable()
export class PancakeTokenBuilder {
    readonly TOKENS = {
        USDC: {
            56: {
                decimals: 18,
                symbol: 'USDC',
                address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
                name: 'USD Coin (USDC)'
            }
        },
        DAI: {
            56: {
                decimals: 18,
                symbol: 'DAI',
                address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
                name: 'Dai Token'
            } 
        },
        BUSD: {
            56: {
                decimals: 18,
                symbol: 'BUSD',
                address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
                name: 'BUSD Token'
            } 
        },
        USDT: {
            56: {
                decimals: 18,
                symbol: 'USDT',
                address: '0x55d398326f99059fF775485246999027B3197955',
                name: 'Tether USD'
            } 
        },
        BTCB: {
            56: {
                decimals: 18,
                symbol: 'BTCB',
                address: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
                name: 'BTCB Token'
            }
        },
        BAT: {
            56: {
                decimals: 18,
                symbol: 'BAT',
                address: '0x101d82428437127bf1608f699cd651e6abf9766e',
                name: 'Binance-Peg Basic Attention Token'
            }
        },
        ETH: {
            56: {
                decimals: 18,
                symbol: 'ETH',
                address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
                name: 'Ethereum Token'
            }
        },
        WETH: {
            56: {
                decimals: 18,
                symbol: 'ETH',
                address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
                name: 'Ethereum Token'
            }
        }
    }
    

    public build(chainId: number, token: string): Token {
        const tokenFormat = token.toUpperCase()

        if(tokenFormat == 'WBNB') {
            return WETH[chainId]
        }

        const tokenData = this.TOKENS[tokenFormat][chainId]
        return new Token(chainId, tokenData.address, tokenData.decimals, tokenData.symbol, tokenData.name)
    }
}