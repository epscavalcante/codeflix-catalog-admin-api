import GoogleCloudStorage from '@core/shared/infra/storage/google-cloud.storage';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';

@Global()
@Module({
    providers: [
        {
            provide: 'Storage',
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
            inject: [ConfigService],
        },
    ],
    exports: ['Storage'],
})
export class SharedModule {}
