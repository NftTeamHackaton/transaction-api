import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceInfoEntity } from 'src/entities/serviceInfo.entity';
import { Repository } from 'typeorm';
import { ServiceInfoDto } from './service-info.dto';

@Injectable()
export class ServiceInfoService {

    constructor(
        @InjectRepository(ServiceInfoEntity)
        private readonly serviceInfoRepository: Repository<ServiceInfoEntity>
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

}
