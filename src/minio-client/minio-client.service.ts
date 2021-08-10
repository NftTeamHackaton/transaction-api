import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { BufferedFile } from './file.model';
import * as crypto from 'crypto';
import { ConfigService } from 'src/config/config.service';
import { Repository } from 'typeorm';
import { FileEntity } from 'src/entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MinioClientService {
  constructor(
      @InjectRepository(FileEntity)
      private readonly fileRepository: Repository<FileEntity>,
      private readonly minio: MinioService,
      private readonly config: ConfigService
  ) {
    this.logger = new Logger('MinioService');
  }

  private readonly logger: Logger;
  private readonly bucketName = this.config.get('MINIO_BUCKET_NAME');

  public get client() {
    return this.minio.client;
  }

  public async upload(
    file: BufferedFile,
    bucketName: string = this.bucketName,
  ): Promise<FileEntity> {
    if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
      throw new HttpException(
        'File type not supported',
        HttpStatus.BAD_REQUEST,
      );
    }
    const timestamp = Date.now().toString();
    const hashedFileName = crypto
      .createHash('md5')
      .update(timestamp)
      .digest('hex');
    const extension = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );
    const metaData = {
      'Content-Type': file.mimetype,
    };

    // We need to append the extension at the end otherwise Minio will save it as a generic file
    const fileName = hashedFileName + extension;

    this.client.putObject(
      bucketName,
      fileName,
      file.buffer,
      metaData,
      function (err, res) {
        if (err) {
          throw new HttpException(
            'Error uploading file',
            HttpStatus.BAD_REQUEST,
          );
        }
      },
    );
    return this.fileRepository.save({
        size: file.size,
        hashedFileName: hashedFileName,
        extension: extension,
        mimeType: file.mimetype,
        url: `${this.config.get('MINIO_ENDPOINT')}/${this.config.get('MINIO_BUCKET_NAME')}/${fileName}`,
        originalName: file.originalname
    });
  }

  async delete(objetName: string, bucketName: string = this.bucketName) {
    this.client.removeObject(bucketName, objetName, function (err, res) {
      if (err)
        throw new HttpException(
          'An error occured when deleting!',
          HttpStatus.BAD_REQUEST,
        );
    });
  }
}