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
