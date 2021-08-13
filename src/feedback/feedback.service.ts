import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramService } from 'nestjs-telegram';
import { FeedBack } from 'src/entities/feedback.entity';
import { Repository } from 'typeorm';
import { FeedBackCreateDto } from './feedbackCreate.dto';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(FeedBack)
        private readonly feedbackRepository: Repository<FeedBack>,
        private readonly telegramService: TelegramService
    ) {}

    public async create(feedbackCreateDto: FeedBackCreateDto) {
        const text = `
* name: ${feedbackCreateDto.name};
* title: ${feedbackCreateDto.title ? feedbackCreateDto.title : ''};
* text: ${feedbackCreateDto.text};
* email: ${feedbackCreateDto.email};
        `
        await this.telegramService.sendMessage({
            chat_id: '-1001568607593',
            text: text,
            parse_mode: 'markdown'
        }).toPromise()
        return this.feedbackRepository.save({
            name: feedbackCreateDto.name,
            email: feedbackCreateDto.email,
            text: feedbackCreateDto.text,
            title: feedbackCreateDto.title ? feedbackCreateDto.title : '',
            createdAt: new Date
        })
    }
}
