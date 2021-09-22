import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class ConfigService {
    private readonly envConfig: { [key: string]: string };

    constructor(filePath: any) {
        this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    }

    get(key: string): string {
        return this.envConfig[key];
    }

    getHttpTimeout(): number {
        return this.get('HTTP_TIMEOUT') == undefined ? 5000 : Number(this.get('HTTP_TIMEOUT'))
    }

    getHttpMaxRedirects(): number {
        return this.get('HTTP_MAX_REDIRECTS') == undefined ? 5 : Number(this.get('HTTP_MAX_REDIRECTS'))
    }

    getSubgraphUrl(network: string): string {
        const SUBGRAPH_URLS = {
            'mainnet':
                'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2',
            'goerli':
                'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-goerli-v2',
            'kovan':
                'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-kovan-v2',
            'polygon':
                'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2',
        };   
        return SUBGRAPH_URLS[network]
    }

    getEtherscanApiBaseUrl(network: string): string {
        network = network.toLowerCase()
        if(network == 'kovan') {
            return "https://api-kovan.etherscan.io"
        }

        if(network == 'mainnet') {
            return "https://api.etherscan.io"
        }
        return "https://api.etherscan.io"
    }

    getInfuraURL(network: string): string {
        network = network.toLowerCase()
        if(network == 'kovan') {
            return "https://kovan.infura.io/v3/0d8a073ce66b4854b3d7aae977591077"
        }
        return "https://mainnet.infura.io/v3/0d8a073ce66b4854b3d7aae977591077"
    }

    getAaveLendingPoolAddress(network: string) {
        network = network.toLowerCase()
        if(network == 'kovan') {
            return "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe"
        }
        return "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9"
    }

    getEtherscanApiKey(): string {
        return this.get('ETHERSCAN_API_KEY')
    }

    getSmartChainEtherscanApiKey(): string {
        return this.get('SMART_CHAIN_ETHERSCAN_API_KEY')
    }

    getInkaEthereumServiceAdress(): string[] {
        return [
            this.getAaveProviderAddress(),
            this.getCompoundProviderAddress(),
            this.getUniswapProviderAddress(),
        ]
    }

    getCoinMarketCapURL(): string {
        return this.get('COIN_MARKET_CAP_URL')
    }

    getCoinMarketCapKey(): string {
        return this.get('COIN_MARKET_CAP_KEY')
    }

    getCompoundProviderAddress(): string {
        return this.get('COMPOUND_PROVIDER')
    }

    getAaveProviderAddress(): string {
        return this.get('AAVE_PROVIDER')
    }

    getUniswapProviderAddress(): string {
        return this.get('UNISWAP_PROVIDER')
    }

    getPancakeSwapProviderAddress(): string {
        return this.get('PANCAKESWAP_PROVIDER')
    }

    getUniV2Address(): string {
        return this.get('UNI_V2')
    }

    getUniswapRouterAddress(): string {
        return this.get('UNISWAP_ROUTER')
    }

    getTypeOrmConfig(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
    
            host: this.get('DATABASE_HOST'),
            port: parseInt(this.get('DATABASE_PORT')),
            username: this.get('DATABASE_USERNAME'),
            password: this.get('DATABASE_PASSWORD'),
            database: this.get('DATABASE_NAME'),

            entities: ["dist/**/*.entity.js"],

            migrationsTableName: 'migration',

            migrations: ['src/migration/*.ts'],

            cli: {
            migrationsDir: 'src/migration',
            },

            ssl: false,
        };
    }
}
