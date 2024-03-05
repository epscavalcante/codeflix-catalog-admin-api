import AudioVideoMediaModel from '@core/video/infra/database/sequelize/models/video-audio-media.model';
import VideoImageMediaModel from '@core/video/infra/database/sequelize/models/video-image-media.model';
import VideoModel, {
    VideoCastMemberModel,
    VideoCategoryModel,
    VideoGenreModel,
} from '@core/video/infra/database/sequelize/models/video.model';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import VideosController from './videos.controller';
import { CategoriesModule } from '../categories/categories.module';
import { GenresModule } from '../genres/genres.module';
import { CastMembersModule } from '../cast-members/cast-members.module';
import { VIDEO_PROVIDERS } from './videos.providers';

@Module({
    imports: [
        SequelizeModule.forFeature([
            VideoModel,
            VideoGenreModel,
            VideoCategoryModel,
            VideoCastMemberModel,
            VideoImageMediaModel,
            AudioVideoMediaModel,
        ]),
        CategoriesModule,
        GenresModule,
        CastMembersModule,
    ],
    controllers: [VideosController],
    providers: [
        ...Object.values(VIDEO_PROVIDERS.REPOSITORIES),
        ...Object.values(VIDEO_PROVIDERS.USE_CASES),
        // ...Object.values(VIDEO_PROVIDERS.VALIDATIONS),
        // ...Object.values(VIDEO_PROVIDERS.HANDLERS),
    ],
    // exports: [
    //     VIDEO_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
    //     VIDEO_PROVIDERS.VALIDATIONS.VIDEOS_IDS_EXISTS_IN_DATABASE_VALIDATOR,
    // ],
})
export class VideosModule {}
