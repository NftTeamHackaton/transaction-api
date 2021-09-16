import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoAsset } from 'src/entities/cryptoAsset.entity';
import { CryptoList } from 'src/entities/cryptoList.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { AddAssetDto } from './addAsset.dto';
import { CreateListDto } from './createList.dto';
import {smartchain} from 'src/assets/smartchain/output';
import { response } from 'express';

@Injectable()
export class CryptoListService {
    constructor(
        @InjectRepository(CryptoList)
        private readonly cryptoListRepoistory: Repository<CryptoList>,
        @InjectRepository(CryptoAsset)
        private readonly cryptoAssetRepository: Repository<CryptoAsset>
    ) {}

    public async search(network: string, query: string|undefined) {
        const list = await this.cryptoListRepoistory.findOne({network})

        const responseObj = {
            id: list.id,
            version: list.version,
            meta: list.meta,
            network: list.network,
            assets: []
        }

        if(!list) {
            throw new NotFoundException('Crypto list not found!')
        }

        const queryBuilder = this.cryptoAssetRepository.createQueryBuilder('q')
        
        if(!query) {
            const assets = await this.cryptoAssetRepository.find({take: 2000, where: {cryptoList: list}})
            responseObj.assets = assets
            return responseObj
        }

        const assets = await queryBuilder
            .where("q.cryptoList.id = :listId AND LOWER(q.symbol) ILIKE LOWER(:query)", {listId: list.id, query: `%${query}%`})
            .orWhere("q.cryptoList.id = :listId AND LOWER(q.name) ILIKE LOWER(:query)", {listId: list.id, query: `%${query}%`})
            .getMany()
        responseObj.assets = assets
        return responseObj
    }

    public async manyAssetsAdd() {
        console.log(smartchain.length)
        return this.addAsset({
            listId: 1,
            assets: smartchain
        })
    }

    public async detailCryptoList(id: number): Promise<CryptoList> {
        return this.cryptoListRepoistory.findOne({id})
    }

    public async allList(): Promise<CryptoList[]> {
        return this.cryptoListRepoistory.find()
    }

    public async listAssets(id: number): Promise<CryptoAsset[]> {
        const list = await this.cryptoListRepoistory.findOne(id)

        if(!list) {
            throw new NotFoundException('List not found!')
        }


        return this.cryptoAssetRepository.find({
            where: {
                cryptoList: list
            }
        })
    }

    public async all(network: string) {
        return this.cryptoListRepoistory.find({where: {network}, relations: ['assets']})
    }

    public async assetList() {
        return this.cryptoListRepoistory.findOne({relations: ['assets']})
    }

    public async createList(createListDto: CreateListDto): Promise<CryptoList> {

        if(await this.cryptoListRepoistory.count({network: createListDto.network}) > 0) {
            throw new BadRequestException(`List with this network: ${createListDto.network} exist!`)
        }

        return this.cryptoListRepoistory.save({
            version: 0,
            meta: createListDto.meta,
            network: createListDto.network
        })
    }

    public async addAsset(addAssetDto: AddAssetDto): Promise<void> {
        const list = await this.cryptoListRepoistory.findOne(addAssetDto.listId)
        
        if(!list) {
            throw new NotFoundException('Entity not found!')
        }
        console.log(addAssetDto.assets.length)
        for(let i = 0; i < addAssetDto.assets.length; i++) {
            const asset: CryptoAssetInterface = addAssetDto.assets[i]
            const assetInDb = await this.cryptoAssetRepository.findOne({ symbol: asset.symbol, type: asset.type, network: asset.network })

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

    public async checkVersion(network: string, version: number): Promise<boolean> {
        const list = await this.cryptoListRepoistory.findOne({network})

        if(!list) {
            throw new NotFoundException('Entity not found!')
        }

        return list.version == version
    }
}
