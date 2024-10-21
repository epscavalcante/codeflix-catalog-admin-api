//import GoogleCloudStorage from '@core/shared/infra/storage/google-cloud.storage';
import MinioStorage from '@core/shared/infra/storage/minio-storage';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import * as MinioSdk from 'minio';

@Global()
@Module({
    providers: [
        {
            provide: 'Storage',
            useFactory: (configService: ConfigService) => {
                const minioSdk = new MinioSdk.Client({
                    endPoint: 'codeflix-catalog-admin-minio',
                    port: 9000,
                    useSSL: false,
                    accessKey: configService.get('MINIO_ACCESS_KEY')!,
                    secretKey: configService.get('MINIO_SECRET_KEY')!,
                });

                return new MinioStorage(
                    minioSdk,
                    configService.get('MINIO_BUCKET_NAME')!,
                );
            },
            /*
            useFactory: (configService: ConfigService) => {
                const googleCloudStorageSdk = new GoogleCloudStorageSdk({
                    credentials: configService.get(
                        'GOOGLE_CLOUD_STORAGE_CREDENTIALS',
                    ),
                });
                return new GoogleCloudStorage(
                    googleCloudStorageSdk,
                    configService.get('GOOGLE_CLOUD_STORAGE_BUCKET_NAME')!,
                );
            },
            */
            inject: [ConfigService],
        },
    ],
    exports: ['Storage'],
})
export class SharedModule {}
