import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from 'src/entities/file.entity';
import { StoriesEntity } from 'src/entities/stories.entity';
import { Repository } from 'typeorm';
import { CreateStoriesDto } from './createStories.dto';
import { UpdateStoriesDto } from './updateStories.dto';

@Injectable()
export class StoriesService {
    constructor(
        @InjectRepository(StoriesEntity)
        private readonly storiesRepository: Repository<StoriesEntity>,
        @InjectRepository(FileEntity)
        private readonly fileRepository: Repository<FileEntity>,
    ) {}

    public async list(): Promise<StoriesEntity[]> {
        return this.storiesRepository.find({
            relations: ['preview', 'contents'],
            where: {
                isActive: true
            }
        })
    }

    public async create(createStoriesDto: CreateStoriesDto): Promise<StoriesEntity> {
        const preview = await this.fileRepository.findOne(createStoriesDto.previewId)
        const contents: FileEntity[] = [];
        if(!preview) {
            throw new NotFoundException('Preview file not found!')
        }

        const storiesExistsPreview = await this.storiesRepository.findOne({
            relations: ['preview'],
            where: {
                preview: {
                    id: preview.id
                }
            }
        })

        if(storiesExistsPreview) {
            throw new BadRequestException('Stories this preview already exists!')
        }

        for(let i = 0; i < createStoriesDto.contents.length; i++) {
            const file = await this.fileRepository.findOne(createStoriesDto.contents[i])

            if(!file) {
                throw new NotFoundException('Content file not found!')
            }
            contents.push(file);
        }


        return this.storiesRepository.save({
            name: createStoriesDto.name,
            preview: preview,
            contents: contents,
            isActive: true
        });
    }

    public async update(updateStoriesDto: UpdateStoriesDto) {
        const stories = await this.storiesRepository.findOne(updateStoriesDto.storiesId, {relations: ['preview', 'contents']})
        const preview = await this.fileRepository.findOne(updateStoriesDto.previewId)
        const contents: FileEntity[] = [];

        if(!stories) {
            throw new NotFoundException('Stories not found!')
        }

        if(!preview) {
            throw new NotFoundException('Preview file not found!')
        }

        const storiesExistsPreview = await this.storiesRepository.findOne({
            relations: ['preview'],
            where: {
                preview: {
                    id: preview.id
                }
            }
        })

        if(stories.preview.id != preview.id && storiesExistsPreview) {
            throw new BadRequestException('Stories this preview already exists!')
        }

        for(let i = 0; i < updateStoriesDto.contents.length; i++) {
            const file = await this.fileRepository.findOne(updateStoriesDto.contents[i])

            if(!file) {
                throw new NotFoundException('Content file not found!')
            }
            contents.push(file);
        }
        stories.contents = contents
        stories.preview = preview
        stories.name = updateStoriesDto.name

        return this.storiesRepository.save(stories);
    }

    public async delete(storiesId: number) {
        const stories = await this.storiesRepository.findOne(storiesId)

        if(!stories) {
            throw new NotFoundException('Stories not found!')
        }

        stories.isActive = false
        return this.storiesRepository.save(stories)
    }
}
