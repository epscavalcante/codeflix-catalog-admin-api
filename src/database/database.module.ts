import { Global, Module, Scope } from '@nestjs/common';
import { SequelizeModule, getConnectionToken } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { ConfigSchemaType } from '../config/config.module';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import {
    GenreCategoryModel,
    GenreModel,
} from '@core/genre/infra/database/sequelize/models/genre.model';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import { Sequelize } from 'sequelize';
import VideoModel, {
    VideoCastMemberModel,
    VideoCategoryModel,
    VideoGenreModel,
} from '@core/video/infra/database/sequelize/models/video.model';
import VideoImageMediaModel from '@core/video/infra/database/sequelize/models/video-image-media.model';
import AudioVideoMediaModel from '@core/video/infra/database/sequelize/models/video-audio-media.model';

const models = [
    CategoryModel,
    CastMemberModel,
    GenreModel,
    VideoModel,
    GenreCategoryModel,
    VideoCategoryModel,
    VideoGenreModel,
    VideoCastMemberModel,
    VideoImageMediaModel,
    AudioVideoMediaModel,
];

@Global()
@Module({
    imports: [
        SequelizeModule.forRootAsync({
            useFactory: (configService: ConfigService<ConfigSchemaType>) => {
                const dbVendor = configService.get('DB_VENDOR');

                if (dbVendor === 'sqlite') {
                    return {
                        dialect: 'sqlite',
                        host: configService.get('DB_HOST'),
                        logging: configService.get('DB_LOGGING'),
                        autoLoadModels: configService.get(
                            'DB_AUTO_LOAD_MODELS',
                        ),
                        models,
                    };
                }

                if (dbVendor === 'mysql') {
                    return {
                        dialect: 'mysql',
                        host: configService.get('DB_HOST'),
                        port: configService.get('DB_PORT'),
                        database: configService.get('DB_DATABASE'),
                        username: configService.get('DB_USERNAME'),
                        password: configService.get('DB_PASSWORD'),
                        logging: configService.get('DB_LOGGING'),
                        autoLoadModels: configService.get(
                            'DB_AUTO_LOAD_MODELS',
                        ),
                        models,
                    };
                }

                throw new Error(`Unsupported database config. ${dbVendor}`);
            },
            inject: [ConfigService],
        }),
    ],
    providers: [
        {
            provide: SequelizeUnitOfWorkRepository,
            useFactory: (sequelize: Sequelize) => {
                return new SequelizeUnitOfWorkRepository(sequelize);
            },
            inject: [getConnectionToken()],
            scope: Scope.REQUEST,
        },
        {
            provide: 'UnitOfWork',
            useExisting: SequelizeUnitOfWorkRepository,
            scope: Scope.REQUEST,
        },
    ],
    exports: ['UnitOfWork'],
})
export class DatabaseModule {}
