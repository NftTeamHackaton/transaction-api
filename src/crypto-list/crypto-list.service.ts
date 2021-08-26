import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoAsset } from 'src/entities/cryptoAsset.entity';
import { CryptoList } from 'src/entities/cryptoList.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { AddAssetDto } from './addAsset.dto';
import { CreateListDto } from './createList.dto';

@Injectable()
export class CryptoListService {
    constructor(
        @InjectRepository(CryptoList)
        private readonly cryptoListRepoistory: Repository<CryptoList>,
        @InjectRepository(CryptoAsset)
        private readonly cryptoAssetRepository: Repository<CryptoAsset>
    ) {}

    public async assetList() {
        return this.cryptoListRepoistory.findOne({relations: ['assets']})
    }

    public async createList(createListDto: CreateListDto): Promise<CryptoList> {
        return this.cryptoListRepoistory.save({
            version: 0,
            meta: createListDto.meta
        })
    }

    public async addAsset(addAssetDto: AddAssetDto): Promise<void> {
        const list = await this.cryptoListRepoistory.findOne(addAssetDto.listId)

        if(!list) {
            throw new NotFoundException('Entity not found!')
        }

        for(let i = 0; i < addAssetDto.assets.length; i++) {
            const asset: CryptoAssetInterface = addAssetDto.assets[i]
            const assetInDb = await this.cryptoAssetRepository.findOne({ symbol: asset.symbol })

            if(assetInDb) {
                continue;
            }
            await this.cryptoAssetRepository.save({
                name: asset.name,
                website: asset.website,
                description: asset.description,
                symbol: asset.symbol,
                type: asset.type,
                logoURI: asset.logoURI,
                network: asset.network,
                explorer: asset.explorer,
                decimals: asset.decimals,
                cryptoList: list,
                contractAddress: asset.contractAddress
            })
            
        }
        list.version += 1
        await this.cryptoListRepoistory.save(list)
    }

    public async checkVersion(version: number): Promise<boolean> {
        const list = await this.cryptoListRepoistory.findOne()

        if(!list) {
            throw new NotFoundException('Entity not found!')
        }

        return list.version == version
    }
}
