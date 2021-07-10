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
