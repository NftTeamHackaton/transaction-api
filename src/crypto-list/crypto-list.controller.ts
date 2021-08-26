import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AddAssetDto } from './addAsset.dto';
import { CreateListDto } from './createList.dto';
import { CryptoListService } from './crypto-list.service';

@Controller('crypto-list')
export class CryptoListController {
    constructor(private readonly cryptoListService: CryptoListService) {}

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

    @Get('/check-version/:version')
    public async checkVersion(@Param('version') version: number, @Res() response: Response) {
        const checkVersion = await this.cryptoListService.checkVersion(version)
        return response.status(HttpStatus.OK).send({checkVersion})
    }

    @Get('/assets')
    public async listAsset(@Res() response: Response) {
        const list = await this.cryptoListService.assetList()
        return response.status(HttpStatus.OK).send(list)
    }
}
