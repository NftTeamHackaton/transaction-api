import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { TelegramModule } from 'nestjs-telegram';
import { ConfigService } from 'src/config/config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedBack } from 'src/entities/feedback.entity';

@Module({
  imports: [  
    TypeOrmModule.forFeature([FeedBack]),
    TelegramModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return { 
          botKey: configService.get('TELEGRAM_API_KEY')
        };
      },
      inject: [ConfigService]
    })
  ],
  providers: [FeedbackService],
  controllers: [FeedbackController]
})
export class FeedbackModule {}
