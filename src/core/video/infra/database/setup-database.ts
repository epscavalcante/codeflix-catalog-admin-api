import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import {
    GenreCategoryModel,
    GenreModel,
} from '@core/genre/infra/database/sequelize/models/genre.model';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import { SequelizeOptions } from 'sequelize-typescript';
import AudioVideoMediaModel from './sequelize/models/video-audio-media.model';
import VideoImageMediaModel from './sequelize/models/video-image-media.model';
import VideoModel, {
    VideoCategoryModel,
    VideoGenreModel,
    VideoCastMemberModel,
} from './sequelize/models/video.model';

export function setupDatabaseForVideo(options: SequelizeOptions = {}) {
    return setupDatabase({
        models: [
            VideoImageMediaModel,
            AudioVideoMediaModel,
            VideoCategoryModel,
            VideoGenreModel,
            GenreCategoryModel,
            VideoCastMemberModel,
            CategoryModel,
            GenreModel,
            CastMemberModel,
            VideoModel,
        ],
        ...options,
    });
}
