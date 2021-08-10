import { DefaultValuePipe, ParseIntPipe, Query, Controller, Post, Get, Param, Body, Res, UseInterceptors, UploadedFile, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { response, Response } from 'express';
import { BufferedFile } from 'src/minio-client/file.model';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { CreateStoriesDto } from './createStories.dto';
import { StoriesService } from './stories.service';
import { UpdateStoriesDto } from './updateStories.dto';

@Controller('stories')
export class StoriesController {
    constructor(
        private readonly minioClient: MinioClientService,
        private readonly storiesService: StoriesService
    ) {}

    @Post('/image-upload')
    @UseInterceptors(FileInterceptor('image'))
    public async uploadImage(@UploadedFile() image: BufferedFile, @Res() response: Response) {
        const url = await this.minioClient.upload(image)
        return response.status(200).send({url})
    }

    @Get('/list')
    public async list(@Res() response: Response) {
        const stories = await this.storiesService.list();
        return response.status(200).send(stories)
    }

    @Post('/create')
    public async create(@Body() createStoriesDto: CreateStoriesDto, @Res() response: Response) {
        const stories = await this.storiesService.create(createStoriesDto)
        return response.status(200).send(stories)
    }

    @Post('/update')
    public async update(@Body() updateStoriesDto: UpdateStoriesDto, @Res() response: Response) {
        const stories = await this.storiesService.update(updateStoriesDto)
        return response.status(200).send(stories)
    }

    @Post('/delete/:storiesId')
    public async delete(@Param('storiesId') storiesId: number, @Res() response: Response) {
        const stories = await this.storiesService.delete(storiesId)
        return response.status(200).send(stories)
    }
}
