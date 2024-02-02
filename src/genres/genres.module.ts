import {
    GenreCategoryModel,
    GenreModel,
} from '@core/genre/infra/database/sequelize/models/genre.model';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GenresController } from './genres.controller';
import { GENRE_PROVIDERS } from './genres.provider';
import { CategoriesModule } from '../categories/categories.module';

@Module({
    imports: [
        SequelizeModule.forFeature([GenreModel, GenreCategoryModel]),
        CategoriesModule,
    ],
    controllers: [GenresController],
    providers: [
        ...Object.values(GENRE_PROVIDERS.REPOSITORIES),
        ...Object.values(GENRE_PROVIDERS.USE_CASES),
        ...Object.values(GENRE_PROVIDERS.VALIDATIONS),
    ],
    exports: [
        GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        GENRE_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR
    ],
})
export class GenresModule {}
