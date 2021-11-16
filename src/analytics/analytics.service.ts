import { BadRequestException, CACHE_MANAGER, HttpService, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Erc20TransactionEntity } from 'src/entities/erc20Transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name)

    constructor(
        @InjectRepository(Erc20TransactionEntity)
        private readonly erc20TransactionRepository: Repository<Erc20TransactionEntity>,
        private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    public async operationAnalytics(address: string) {
        const cacheData = await this.cacheManager.get(address)
        if(!cacheData) {
            const data = await this.analytcsFormatted(address)
            await this.cacheManager.set(address, data, {
                ttl: 30000
            })
        }
        return this.cacheManager.get(address)
        
    }

    public async analytcsFormatted(address: string) {
        const staking = await this.staking(address)
        const lp = await this.lp(address)
        const swap = await this.swap(address)
        const wallet = await this.wallet(address)
        return {staking, lp, swap, wallet}
    }

    private async wallet(address: string) {
        try {
            const walletOperations = await this.erc20TransactionRepository.createQueryBuilder('q')
                .select('q.tokenSymbol', 'tokenSymbol')
                .addSelect('q.tokenDecimals', 'tokenDecimals')
                .addSelect('q.operation', 'operation')
                .addSelect('sum(q.value::numeric)', 'sum')
                .where('q.operation = \'\' and q.from = :from', {
                    from: address
                })
                .orWhere('q.operation = \'\' and q.to = :to', {
                    to: address
                })
                .groupBy('q.tokenSymbol')
                .addGroupBy('q.service')
                .addGroupBy('q.tokenDecimals')
                .addGroupBy('q.operation')
                .getRawMany()
                console.log(walletOperations)
            const walletData = {
                usd: 0,
                data: []
            }
            for(let i = 0; i < walletOperations.length; i++) {
                if(this.even(i)) {
                    await this.delay(1000)
                }

                const walletOperation = walletOperations[i]
                const value = walletOperation.sum
                const decimals = walletOperation.tokenDecimals
                const divisor = Math.pow(10, decimals) // Web3.utils.toBN(10).pow(decimals)
                console.log(divisor.toString())
                const price = value / divisor
                let usdPrice = 0
                
                if(price > 0) {
                    usdPrice = await this.cacheManager.get(walletOperation.tokenSymbol.toUpperCase())
                }
                const data = {
                    symbol: walletOperation.tokenSymbol,
                    decimals: walletOperation.tokenDecimals,
                    price: price.toString(),
                    network: 'ethereum',
                    usd: usdPrice
                }

                walletData.usd += usdPrice
                walletData.data.push(data)
            }
            return walletData;
        } catch (e) {
            let message = e.message

            if(e.response) {
                message = e.response.data
            }

            throw new BadRequestException(message)
        }
    } 
    // swap: {
    //     services: [
    //         {
    //             name: 'uniswap',
    //             logo: "asdasd",
    //             description: "asdasd",
    //             usd: 0,
    //             data: []
    //         }
    //     ]
    // }
    private async swap(address: string) {
        try {
            const uniswapOperations = await this.erc20TransactionRepository.createQueryBuilder('q')
                .select('q.tokenSymbol', 'tokenSymbol')
                .addSelect('q.service', 'service')
                .addSelect('q.tokenDecimals', 'tokenDecimals')
                .addSelect('q.operation', 'operation')
                .addSelect('sum(q.value::numeric)', 'sum')
                .where('(q.operation in (:...operations)) and (q.service in (:...service)) and q.from = :from', {
                    operations: ['swap'], from: address, service: ['uniswap']
                })
                .orWhere('(q.operation in (:...operations)) and (q.service in (:...service)) and q.to = :to', {
                    operations: ['swap'], to: address, service: ['uniswap']
                })
                .groupBy('q.tokenSymbol')
                .addGroupBy('q.service')
                .addGroupBy('q.tokenDecimals')
                .addGroupBy('q.operation')
                .getRawMany()
            const swapData = {
                usd: 0,
                services: [
                    {
                        name: 'uniswap',
                        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/dapps/app.uniswap.org.png",
                        description: "asdasd",
                        usd: 0,
                        data: []
                    }
                ],
            }
            for(let i = 0; i < uniswapOperations.length; i++) {
                if(this.even(i)) {
                    await this.delay(1000)
                }
                const uniswap = uniswapOperations[i]
                const value = uniswap.sum
                const decimals = uniswap.tokenDecimals
                const divisor = Math.pow(10, decimals) // Web3.utils.toBN(10).pow(decimals)
                console.log(divisor.toString())
                const price = value / divisor
                let usdPrice = 0
                
                if(price > 0) {
                    usdPrice = await this.cacheManager.get(uniswap.tokenSymbol.toUpperCase())
                }
                console.log(value.toString())
                const data = {
                    symbol: uniswap.tokenSymbol,
                    decimals: uniswap.tokenDecimals,
                    price: price.toString(),
                    usd: usdPrice
                }

                swapData.usd += usdPrice

                if(uniswap.operation == 'swap') {
                    swapData.services[0].usd += usdPrice
                    swapData.services[0].data.push(data)
                }
            }
            return swapData;
        } catch (e) {
            let message = e.message

            if(e.response) {
                message = e.response.data
            }

            throw new BadRequestException(message)
        }
    }
    private async lp(address: string) {
        try {
            const uniswapOperations = await this.erc20TransactionRepository.createQueryBuilder('q')
                .select('q.tokenSymbol', 'tokenSymbol')
                .addSelect('q.service', 'service')
                .addSelect('q.tokenDecimals', 'tokenDecimals')
                .addSelect('q.operation', 'operation')
                .addSelect('sum(q.value::numeric)', 'sum')
                .where('(q.operation in (:...operations)) and (q.service in (:...service)) and q.from = :from', {
                    operations: ['addLiquidity'], from: address, service: ['uniswap']
                })
                .orWhere('(q.operation in (:...operations)) and (q.service in (:...service)) and q.to = :to', {
                    operations: ['addLiquidity'], to: address, service: ['uniswap']
                })
                .groupBy('q.tokenSymbol')
                .addGroupBy('q.service')
                .addGroupBy('q.tokenDecimals')
                .addGroupBy('q.operation')
                .getRawMany()
            const lpData = {
                usd: 0,
                services: [
                    {
                        name: 'uniswap',
                        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/dapps/app.uniswap.org.png",
                        description: "asdasd",
                        usd: 0,
                        data: []
                    }
                ],
            }
            for(let i = 0; i < uniswapOperations.length; i++) {
                if(this.even(i)) {
                    await this.delay(1000)
                }
                const uniswap = uniswapOperations[i]
                const value = uniswap.sum
                const decimals = uniswap.tokenDecimals
                const divisor = Math.pow(10, decimals) // Web3.utils.toBN(10).pow(decimals)
                console.log(divisor.toString())
                const price = value / divisor
                let usdPrice = 0
                
                if(price > 0) {
                    usdPrice = await this.cacheManager.get(uniswap.tokenSymbol.toUpperCase())
                }
                console.log(value.toString())
                const data = {
                    symbol: uniswap.tokenSymbol,
                    decimals: uniswap.tokenDecimals,
                    price: price.toString(),
                    usd: usdPrice
                }

                lpData.usd += usdPrice

                if(uniswap.operation == 'addLiquidity') {
                    lpData.services[0].usd += usdPrice
                    lpData.services[0].data.push(data)
                }
            }
            return lpData;
        } catch (e) {
            let message = e.message

            if(e.response) {
                message = e.response.data
            }

            throw new BadRequestException(message)
        }
    }

    private async staking(address: string) {
        try {
            const stakingOperations = await this.erc20TransactionRepository.createQueryBuilder('q')
                .select('q.tokenSymbol', 'tokenSymbol')
                .addSelect('q.service', 'service')
                .addSelect('q.tokenDecimals', 'tokenDecimals')
                .addSelect('sum(q.value::numeric)', 'sum')
                .where('(q.service in (:...service)) and q.from = :from', {from: address, service: ['compound', 'aave']})
                .orWhere('(q.service in (:...service)) and q.to = :to', {to: address, service: ['compound', 'aave']})
                .groupBy('q.tokenSymbol')
                .addGroupBy('q.service')
                .addGroupBy('q.tokenDecimals')
                .getRawMany()
            const stakingData = {
                usd: 0,
                services: [
                    {
                        name: 'compound',
                        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/dapps/app.compound.finance.png",
                        description: "asdasd",
                        usd: 0,
                        data: []
                    },
                    {
                        name: 'aave',
                        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/dapps/app.aave.com.png",
                        description: "asdasd",
                        usd: 0,
                        data: []
                    }
                ],
            }
            for(let i = 0; i < stakingOperations.length; i++) {
                if(this.even(i)) {
                    await this.delay(1000)
                }
                const staking = stakingOperations[i]
                const value = staking.sum
                const decimals = staking.tokenDecimals
                const divisor = Math.pow(10, decimals) // Web3.utils.toBN(10).pow(decimals)
                console.log(divisor.toString())
                const price = value / divisor
                let usdPrice = 0
                
                if(price > 0) {
                    usdPrice = await this.cacheManager.get(staking.tokenSymbol.toUpperCase())
                }
                const data = {
                    symbol: staking.tokenSymbol,
                    decimals: staking.tokenDecimals,
                    price: price.toString(),
                    usd: usdPrice
                }

                stakingData.usd += usdPrice

                if(staking.service == 'compound') {
                    stakingData.services[0].usd += usdPrice
                    stakingData.services[0].data.push(data)
                }

                if(staking.service == 'aave') {
                    stakingData.services[1].usd += usdPrice
                    stakingData.services[1].data.push(data)
                }
            }
            return stakingData;
        } catch (e) {
            let message = e.message

            if(e.response) {
                message = e.response.data
            }

            throw new BadRequestException(message)
        }
    }

    private even(n: number): boolean {
        return !(n % 2)
    }


    private async delay(second) {
        return new Promise(res => setTimeout(res, second));
    }

    @Cron('0 8 * * *')
    public async handleCron() {
        this.logger.debug('Cache usd price started')
        const response = await this.httpService.get(`/v1/cryptocurrency/listings/latest`).toPromise()
        const data = response.data.data
        for(let i = 0; i < data.length; i++) {
            await this.cacheManager.set(data[i].symbol.toUpperCase(), data[i].quote.USD.price, {
                ttl: 30000
            })
        }
        this.logger.debug('Cache usd price complete!')
    }
}
