import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get('/operation-analytic/:address')
    public async operationAnalytic(@Param('address') address: string, @Res() response: Response) {
        const data = await this.analyticsService.operationAnalytics(address.toLowerCase())
        return response.status(200).send(data)
    }
}
