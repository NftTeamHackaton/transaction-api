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

    getEtherscanApiBaseUrl(): string {
        if(this.get('NETWORK') == 'kovan') {
            return "https://api-kovan.etherscan.io"
        }
        return "https://api-kovan.etherscan.io"
    }

    getEtherscanApiKey(): string {
        return this.get('ETHERSCAN_API_KEY')
    }

    getSmartChainEtherscanApiKey(): string {
        return this.get('SMART_CHAIN_ETHERSCAN_API_KEY')
    }
    // COMPOUND_PROVIDER=0x031A512148DBFDB933E41F2f6824D737830595Be
    // AAVE_PROVIDER=0x2a2c4c74eADB37A76Fc1da7924c60fA466bAD334
    // UNISWAP_PROVIDER=0xcc1b14a6cEF311050eb3A8690F871F98d1F7c4B7
    // PANCAKESWAP_PROVIDER=0xCD1a49064887e25f8741aA43E1fb2b4852D08181
    
    // UNI_V2=0xd1106dB81792a47DBb702Ad714ca63eF83463309
    // UNISWAP_ROUTER=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
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
