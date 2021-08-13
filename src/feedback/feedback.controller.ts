import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { FeedbackService } from './feedback.service';
import { FeedBackCreateDto } from './feedbackCreate.dto';

@Controller('feedback')
export class FeedbackController {

    constructor(
        private readonly feedbackService: FeedbackService
    ) {}

    @Post('/create')
    public async create(@Body() feedbackCreateDto: FeedBackCreateDto, @Res() response: Response) {
        const feedback = await this.feedbackService.create(feedbackCreateDto)
        return response.status(HttpStatus.CREATED).send(feedback)
    }

}
