import { Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { MinioModule } from 'nestjs-minio-client';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from 'src/entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    MinioModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        endPoint: configService.get('MINIO_DOCKER_ENDPOINT'),
        port: parseInt(configService.get('MINIO_PORT')),
        useSSL: false,
        accessKey: configService.get('MINIO_ACCESS_KEY'),
        secretKey: configService.get('MINIO_SECRET_KEY')
      }),
      inject: [ConfigService]
    })
  ],
  providers: [MinioClientService],
  exports: [MinioClientService]
})
export class MinioClientModule {}
