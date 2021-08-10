import { Module } from '@nestjs/common';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { MinioModule } from 'nestjs-minio-client';
import { MinioClientModule } from 'src/minio-client/minio-client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from 'src/entities/file.entity';
import { StoriesEntity } from 'src/entities/stories.entity';

@Module({
  imports: [
    MinioClientModule,
    TypeOrmModule.forFeature([FileEntity, StoriesEntity])
  ],
  controllers: [StoriesController],
  providers: [StoriesService]
})
export class StoriesModule {}
