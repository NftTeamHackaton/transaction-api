import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceInfoEntity } from 'src/entities/serviceInfo.entity';
import { Repository } from 'typeorm';
import { ServiceInfoDto } from './service-info.dto';
import { Registry } from './services/registry';

@Injectable()
export class ServiceInfoService {

    private readonly logger = new Logger(ServiceInfoService.name)

    constructor(
        @InjectRepository(ServiceInfoEntity)
        private readonly serviceInfoRepository: Repository<ServiceInfoEntity>,
        private readonly serviceRegistry: Registry
    ) {}

    public async search(name: string){
        const stakingData = await this.serviceInfoRepository.createQueryBuilder('s')
            .where("s.name like :name and category = :category", {name: `%${name}%`, category: "staking"})
            .orWhere("s.symbol like :name and category = :category", {name: `%${name}%`, category: "staking"})
            .getMany()
        const liquidityData = await this.serviceInfoRepository.createQueryBuilder('s')
            .where("s.name like :name and category = :category", {name: `%${name}%`, category: "liquidity"})
            .orWhere("s.symbol like :name and category = :category", {name: `%${name}%`, category: "liquidity"})
            .getMany()

        return this.formatData(stakingData, liquidityData)
    }

    public async create(serviceInfoDto: ServiceInfoDto[]) {
        for(let i = 0; i < serviceInfoDto.length; i++) {
            const data = serviceInfoDto[i]
            const exist = await this.serviceInfoRepository.count({
                where: {
                    symbol: data.symbol,
                    service: data.service,
                    category: data.category
                }
            })
            if(exist > 0) {
                continue;
            }

            await this.serviceInfoRepository.save(data)
        }
        return this.allList()
    }

    public async allList() {
        const stakingData = await this.serviceInfoRepository.find({category: "staking"})
        const liquidityData = await this.serviceInfoRepository.find({category: "liquidity"})
        return this.formatData(stakingData, liquidityData)
    }

    private formatData(stakingData: ServiceInfoEntity[], liquidityData: ServiceInfoEntity[]) {
        return {
            staking: stakingData,
            liquidity: liquidityData
        }
    }

    @Cron('0 1 * * *')
    public async updateData() {
        this.logger.debug("Start update apy")
        const network = 'kovan'
        const services = this.serviceRegistry.getServices()
        for (let i = 0; i < services.length; i++) {
            const data = await this.serviceRegistry.getAPYByService(network, services[i])
            for (let z = 0; z < data.length; z++) {
                this.logger.debug(data)
                const info = await this.serviceInfoRepository.findOne({
                    symbol: data[z].symbol,
                    service: data[z].service,
                })
                this.logger.debug(info)
                if(!info) {
                    throw new NotFoundException('Info not found')
                }
                info.apy = data[z].apy
                await this.serviceInfoRepository.save(info)
            }
        }
        this.logger.debug("End update apy")
    }

}
