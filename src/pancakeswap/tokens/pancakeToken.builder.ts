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
        },
        ADA: {
            56: {
                decimals: 18,
                symbol: 'ADA',
                address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
                name: 'Cardano Token'
            }
        },
        XRP: {
            56: {
                decimals: 18,
                symbol: 'XRP',
                address: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE',
                name: 'XRP Token'
            }
        },
        DOGE: {
            56: {
                decimals: 8,
                symbol: 'DOGE',
                address: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43',
                name: 'Binance-Peg Dogecoin'
            }
        },
        DOT: {
            56: {
                decimals: 8,
                symbol: 'DOT',
                address: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
                name: 'Polkadot Token'
            }
        },
        UNI: {
            56: {
                decimals: 18,
                symbol: 'UNI',
                address: '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1',
                name: 'Uniswap'
            }
        },
        LINK: {
            56: {
                decimals: 18,
                symbol: 'LINK',
                address: '0xa36085F69e2889c224210F603D836748e7dC0088',
                name: 'Chainlink Token'
            }
        },
        LTC: {
            56: {
                decimals: 18,
                symbol: 'LTC',
                address: '0x4338665CBB7B2485A8855A139b75D5e34AB0DB94',
                name: 'Litecoin Token'
            }
        },
        BCH: {
            56: {
                decimals: 18,
                symbol: 'BCH',
                address: '0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf',
                name: 'Bitcoin Cash Token'
            }
        },
        FIL: {
            56: {
                decimals: 18,
                symbol: 'FIL',
                address: '0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153',
                name: 'Filecoin'
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