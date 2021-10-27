import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { requestInfos } from './raydium.utils';
import { Cache } from 'cache-manager';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class RaydiumService {
    private readonly logger = new Logger(RaydiumService.name)

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    @Cron('45 * * * * *')
    async handleCron() {
        this.logger.debug('Start sync raydium pools')
        const data = await requestInfos()
        for (let key in data) {
            const pool = data[key]
            await this.cacheManager.set(pool.name, pool, {
                ttl: 30000
            })
        }
        this.logger.debug('Raydium pools sync complete')

    }
}
