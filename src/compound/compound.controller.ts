import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { CompoundService } from './compound.service';

@Controller('compound')
export class CompoundController {
    constructor(private readonly compoundService: CompoundService) {}

    @Get('/account/:address')
    public async accountData(@Param('address') address: string, @Res() response: Response) {
        await this.compoundService.getAccountData(address);
        return response.status(200).send({})
    }
}
