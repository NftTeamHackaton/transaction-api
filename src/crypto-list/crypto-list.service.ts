import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoAsset } from 'src/entities/cryptoAsset.entity';
import { CryptoList } from 'src/entities/cryptoList.entity';
import { Repository } from 'typeorm';
import { AddAssetDto } from './addAsset.dto';
import { CreateListDto } from './createList.dto';
import {smartchain, solana} from 'src/assets/smartchain/output';
import { BindAssetDto } from './bindAsset.dto';

@Injectable()
export class CryptoListService {
    constructor(
        @InjectRepository(CryptoList)
        private readonly cryptoListRepoistory: Repository<CryptoList>,
        @InjectRepository(CryptoAsset)
        private readonly cryptoAssetRepository: Repository<CryptoAsset>
    ) {}

    public async bindAllAsset(listId: number) {
        const list = await this.cryptoListRepoistory.findOne({id: listId}, {relations: ['assets']})
        if(!list) {
            throw new NotFoundException('Entity not found!')
        }

        const assets = await this.cryptoAssetRepository.find()

        for(let i = 0; i < assets.length; i++) {
            list.assets.push(assets[i])
        }
        list.version += 1
        return this.cryptoListRepoistory.save(list)
    }

    public async bindAsset(bindAssetDto: BindAssetDto) {
        const list = await this.cryptoListRepoistory.findOne({id: bindAssetDto.listId}, {relations: ['assets']})

        if(!list) {
            throw new NotFoundException('Entity not found!')
        }

        for(let i = 0; i < bindAssetDto.assets.length; i++) {
            const assetData = bindAssetDto.assets[i]
            const asset = await this.cryptoAssetRepository.findOne({
                symbol: assetData.symbol, 
                network: assetData.network,
                type: assetData.type
            })
            if(!asset) {
                continue
            }
            list.assets.push(asset)
        }
        list.version += 1
        return this.cryptoListRepoistory.save(list)
    }

    public async search(network: string, query: string|undefined, type: string|undefined) {

        if(type) {
            return this.findListByTypeAndNetwork(network, type)
        }

        const list = await this.cryptoListRepoistory.findOne({network, type: 'tokens'})

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
            const assets = await queryBuilder.leftJoinAndSelect("q.cryptoList", "cryptoList").where("cryptoList.id IN (:...ids)", {ids: [list.id]}).limit(2000).getMany()
            responseObj.assets = assets
            return responseObj
        }

        const assets = await queryBuilder
            .leftJoinAndSelect("q.cryptoList", "cryptoList")
            .where("cryptoList.id = :listId AND LOWER(q.symbol) ILIKE LOWER(:query)", {listId: list.id, query: `%${query}%`})
            .orWhere("cryptoList.id = :listId AND LOWER(q.name) ILIKE LOWER(:query)", {listId: list.id, query: `%${query}%`})
            .getMany()
        responseObj.assets = assets
        return responseObj
    }

    public async swapListAdd() {
        const list = await this.cryptoListRepoistory.findOne(7, {relations: ['assets']})
        const symbolsSolana = []
        const symbolsBSC = ['MONI', 'MX', 'NFT', 'NAOS', 'NRV', 'NYA', 'O3', 'OG', 'PHA', 'PORTO', 'PROM', 'PSG', 'QI', 'QUIDD', 'QSD', 'QUSD']
        console.log(symbolsSolana.length, symbolsBSC.length)
        for(let i = 0; i < symbolsSolana.length; i++) {
            const asset = await this.cryptoAssetRepository.findOne({symbol: symbolsSolana[i], network: 'solana'})
            if(asset) {
                list.assets.push(asset)
            }
        }

        for(let z = 0; z < symbolsBSC.length; z++) {
            const asset = await this.cryptoAssetRepository.findOne({symbol: symbolsBSC[z], network: 'smartchain'})
            if(asset) {
                list.assets.push(asset)
            }
        }
        return this.cryptoListRepoistory.save(list)
    }

    public async manyAssetsAdd(network: string) {
        let assets = []
        if(network == 'smartchain') {
            assets = smartchain
        }

        if(network == 'solana') {
            assets = solana
        }
        return this.addAsset({
            listId: 1,
            assets: assets
        })
    }

    public async detailCryptoList(id: number): Promise<CryptoList> {
        return this.cryptoListRepoistory.findOne({id})
    }

    public async allList(): Promise<CryptoList[]> {
        return this.cryptoListRepoistory.find()
    }

    public async listAssets(id: number): Promise<CryptoAsset[]> {
        const list = await this.cryptoListRepoistory.findOne(id, {relations: ['assets']})
        if(!list) {
            throw new NotFoundException('List not found!')
        }


        return list.assets
    }

    public async all(network: string) {
        return this.cryptoListRepoistory.find({where: {network}, relations: ['assets']})
    }

    public async assetList() {
        return this.cryptoListRepoistory.findOne({relations: ['assets']})
    }

    public async createList(createListDto: CreateListDto): Promise<CryptoList> {

        // if(await this.cryptoListRepoistory.count({network: createListDto.network}) > 0) {
        //     throw new BadRequestException(`List with this network: ${createListDto.network} exist!`)
        // }

        return this.cryptoListRepoistory.save({
            version: 0,
            meta: createListDto.meta,
            network: createListDto.network,
            type: createListDto.type
        })
    }

    public async findListByTypeAndNetwork(network: string, type: string) {
        const cryptoList = await this.cryptoListRepoistory.findOne({network, type}, {relations: ['assets']})
        
        if(!cryptoList) {
            throw new NotFoundException('Entity not found!')
        }
        console.log(cryptoList)
        return cryptoList
    }

    public async addAsset(addAssetDto: AddAssetDto): Promise<void> {
        const list = await this.cryptoListRepoistory.findOne(addAssetDto.listId, {relations: ['assets']})
        
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
            const newAsset = await this.cryptoAssetRepository.save({
                name: asset.name,
                website: asset.website,
                description: asset.description,
                symbol: asset.symbol,
                type: asset.type,
                logoURI: asset.logoURI ? asset.logoURI : '-',
                network: asset.network,
                explorer: asset.explorer,
                decimals: asset.decimals,
                contractAddress: asset.contractAddress
            })
            list.assets.push(newAsset)
            
        }
        list.version += 1
        await this.cryptoListRepoistory.save(list)
    }

    public async checkVersion(network: string, version: number): Promise<boolean> {
        const list = await this.cryptoListRepoistory.findOne({network, type: 'tokens'})

        if(!list) {
            throw new NotFoundException('Entity not found!')
        }

        return list.version == version
    }
}
