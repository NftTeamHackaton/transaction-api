import { Body, Controller, Get, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AddAssetDto } from './addAsset.dto';
import { BindAssetDto } from './bindAsset.dto';
import { CreateListDto } from './createList.dto';
import { CryptoListService } from './crypto-list.service';

@Controller('crypto-list')
export class CryptoListController {
    constructor(private readonly cryptoListService: CryptoListService) {}

    @Get('/many-add')
    public async manyAssetAdd(@Res() response: Response) {
        const list = await this.cryptoListService.manyAssetsAdd()
        return response.status(HttpStatus.OK).send(list)
    }

    @Post('/bind-tokens')
    public async bindTokensToList(@Body() bindAssetDto: BindAssetDto, @Res() response: Response) {
        const list = await this.cryptoListService.bindAsset(bindAssetDto)
        return response.status(HttpStatus.OK).send(list)
    }

    // @Get('/search/:network')
    // public async search(
    //     @Param('network') network: string,
    //     @Query('q') q,
    //     @Res() response: Response
    // ) {
    //     const list = await this.cryptoListService.search(network, q)
    //     return response.status(HttpStatus.OK).send(list)
    // }

    @Get('/all-list')
    public async allList(@Res() response: Response) {
        const list = await this.cryptoListService.allList()
        return response.status(HttpStatus.OK).send(list)
    }

    @Get('/detail/:id')
    public async detailCryptoList(@Param('id') id: number, @Res() response: Response) {
        const list = await this.cryptoListService.detailCryptoList(id)
        return response.status(HttpStatus.OK).send(list)
    }

    @Get('/:network/all')
    public async all(
        @Param('network') network: string, 
        @Query('q') q, 
        @Query('type') type,
        @Res() response: Response
    ) {
        const list = await this.cryptoListService.search(network, q, type)
        return response.status(HttpStatus.OK).send(list)
    }

    @Get('/list-assets/:id')
    public async listAssets(@Param('id') id: number, @Res() response: Response) {
        const assets = await this.cryptoListService.listAssets(id)
        return response.status(HttpStatus.OK).send(assets)
    }

    @Post('/create-list')
    public async createList(@Body() createListDto: CreateListDto, @Res() response: Response) {
        const list = await this.cryptoListService.createList(createListDto)
        return response.status(HttpStatus.CREATED).send(list)
    }

    @Post('/add-asset')
    public async addAsset(@Body() addAssetDto: AddAssetDto, @Res() response: Response) {
        await this.cryptoListService.addAsset(addAssetDto)
        return response.status(HttpStatus.OK).send({message: 'Success assets added!'})
    }

    @Get('/check-version/:network/:version')
    public async checkVersion(@Param('network') network: string, @Param('version') version: number, @Res() response: Response) {
        const checkVersion = await this.cryptoListService.checkVersion(network, version)
        return response.status(HttpStatus.OK).send({checkVersion})
    }

    @Get('/assets')
    public async listAsset(@Res() response: Response) {
        const list = await this.cryptoListService.assetList()
        return response.status(HttpStatus.OK).send(list)
    }
}
