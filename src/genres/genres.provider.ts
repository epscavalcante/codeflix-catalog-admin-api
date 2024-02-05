import { getModelToken } from '@nestjs/sequelize';
import GenreSequelizeRepository from '../core/genre/infra/repositories/genre-sequelize.repository';
import GenreMemoryRepository from '../core/genre/infra/repositories/genre-memory.repository';
import CreateGenreUseCase from '@core/genre/application/use-cases/create-genre.use-case';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ListGenreUseCase from '@core/genre/application/use-cases/list-genre.use-case';
import UpdateGenreUseCase from '@core/genre/application/use-cases/update-genre.use-case';
import FindGenreUseCase from '@core/genre/application/use-cases/find-genre.use-case';
import DeleteGenreUseCase from '@core/genre/application/use-cases/delete-genre.use-case';
import { GenreModel } from '@core/genre/infra/database/sequelize/models/genre.model';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';
import { CATEGORY_PROVIDERS } from '../categories/categories.provider';
import CategoriesIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.validation';
import GenresIdsExistsInDatabaseValidation from '@core/genre/application/validations/genres-ids-exists-in-database.validation';
import ApplicationService from '@core/shared/application/application.service';
import PublishGenreInQueueHandler from '@core/genre/application/handlers/publish-genre-in-queue.handler';

export const REPOSITORIES = {
    GENRE_REPOSITORY: {
        provide: 'GenreRepository',
        useExisting: GenreSequelizeRepository,
    },

    GENRE_MEMORY_REPOSITORY: {
        provide: GenreMemoryRepository,
        useClass: GenreMemoryRepository,
    },

    GENRE_DATABASE_REPOSITORY: {
        provide: GenreSequelizeRepository,
        useFactory: (
            genreModel: typeof GenreModel,
            unitOfWork: SequelizeUnitOfWorkRepository,
        ) => new GenreSequelizeRepository(genreModel, unitOfWork),
        inject: [getModelToken(GenreModel), 'UnitOfWork'],
    },
};

export const USE_CASES = {
    CREATE_GENRE_USE_CASE: {
        provide: CreateGenreUseCase,
        useFactory: (
            applicationService: ApplicationService,
            genreRepository: IGenreRepository,
            categoryRepository: ICategoryRepository,
            categoriesIdsExistsInDatabaseValidation: CategoriesIdsExistsInDatabaseValidation,
        ) => {
            return new CreateGenreUseCase(
                applicationService,
                genreRepository,
                categoryRepository,
                categoriesIdsExistsInDatabaseValidation,
            );
        },
        inject: [
            ApplicationService,
            REPOSITORIES.GENRE_REPOSITORY.provide,
            CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
            CATEGORY_PROVIDERS.VALIDATIONS
                .CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
        ],
    },
    UPDATE_GENRE_USE_CASE: {
        provide: UpdateGenreUseCase,
        useFactory: (
            unitOfWork: IUnitOfWork,
            genreRepository: IGenreRepository,
            categoryRepository: ICategoryRepository,
            categoriesIdsExistsInDatabaseValidation: CategoriesIdsExistsInDatabaseValidation,
        ) =>
            new UpdateGenreUseCase(
                unitOfWork,
                genreRepository,
                categoryRepository,
                categoriesIdsExistsInDatabaseValidation,
            ),
        inject: [
            'UnitOfWork',
            REPOSITORIES.GENRE_REPOSITORY.provide,
            CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
            CATEGORY_PROVIDERS.VALIDATIONS
                .CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
        ],
    },

    FIND_GENRE_USE_CASE: {
        provide: FindGenreUseCase,
        useFactory: (
            genreRepository: IGenreRepository,
            categoryRepository: ICategoryRepository,
        ) => new FindGenreUseCase(genreRepository, categoryRepository),
        inject: [
            REPOSITORIES.GENRE_REPOSITORY.provide,
            CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        ],
    },

    LIST_GENRE_USE_CASE: {
        provide: ListGenreUseCase,
        useFactory: (
            genreRepository: IGenreRepository,
            categoryRepository: ICategoryRepository,
        ) => new ListGenreUseCase(genreRepository, categoryRepository),
        inject: [
            REPOSITORIES.GENRE_REPOSITORY.provide,
            CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        ],
    },

    DELETE_GENRE_USE_CASE: {
        provide: DeleteGenreUseCase,
        useFactory: (
            unitOfWork: IUnitOfWork,
            genreRepository: IGenreRepository,
        ) => new DeleteGenreUseCase(unitOfWork, genreRepository),
        inject: ['UnitOfWork', REPOSITORIES.GENRE_REPOSITORY.provide],
    },
};

export const VALIDATIONS = {
    GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR: {
        provide: GenresIdsExistsInDatabaseValidation,
        useFactory: (genreRepo: IGenreRepository) => {
            return new GenresIdsExistsInDatabaseValidation(genreRepo);
        },
        inject: [REPOSITORIES.GENRE_REPOSITORY.provide],
    },
};

export const HANDLERS = {
    PUBLISH_GENRE_IN_QUEUE_EVENT_HANDLER: {
        provide: PublishGenreInQueueHandler,
        useClass: PublishGenreInQueueHandler,
    },
};

export const GENRE_PROVIDERS = {
    REPOSITORIES,
    USE_CASES,
    VALIDATIONS,
    HANDLERS,
};
