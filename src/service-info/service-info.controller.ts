import { Body, Controller, Get, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ServiceInfoDto } from './service-info.dto';
import { ServiceInfoService } from './service-info.service';

@Controller('service-info')
export class ServiceInfoController {

    constructor(
        private readonly serviceInfoService: ServiceInfoService
    ) {}

    @Get('/all')
    public async all(@Res() response: Response) {
        const data = await this.serviceInfoService.allList()
        return response.status(HttpStatus.OK).send(data)
    }

    @Get('/search')
    public async search(@Query('name') name: string, @Res() response: Response) {
        const data = await this.serviceInfoService.search(name)
        return response.status(HttpStatus.OK).send(data)
    }

    @Post('/add')
    public async create(@Body() serviceInfoDto: ServiceInfoDto[], @Res() response: Response) {
        const data = await this.serviceInfoService.create(serviceInfoDto)
        return response.status(HttpStatus.CREATED).send(data)
    }

}
