import ICastMemberIdsExistsInDatabaseValidation from '@core/cast-member/application/validations/cast-members-ids-exists-in-database.interface';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import ICategoryIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.interface';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import IGenresIdExistsInDatabaseValidation from '@core/genre/application/validations/genres-ids-exists-in-database.interface';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ApplicationService from '@core/shared/application/application.service';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';
import IStorage from '@core/shared/domain/storage.interface';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import CreateVideoUseCase from '@core/video/application/usecases/create/create-video.usecase';
import DeleteVideoUseCase from '@core/video/application/usecases/delete/delete-video.usecase';
import FindVideoUseCase from '@core/video/application/usecases/find/find-video.usecase';
import ProcessAudioVideoUseCase from '@core/video/application/usecases/process-audio-video/process-audio-video.usecase';
import UpdateVideoUseCase from '@core/video/application/usecases/update/update-video.usecase';
import UploadAudioVideoUseCase from '@core/video/application/usecases/upload-audio-video/upload-audio-video.usecase';
import UploadImageUseCase from '@core/video/application/usecases/upload-image/upload-image.usecase';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import VideoModel from '@core/video/infra/database/sequelize/models/video.model';
import VideoMemoryRepository from '@core/video/infra/repositories/video-memory.repository';
import VideoSequelizeRepository from '@core/video/infra/repositories/video-sequelize.repository';
import { getModelToken } from '@nestjs/sequelize';
import { CAST_MEMBER_PROVIDERS } from '../cast-members/cast-members.provider';
import { CATEGORY_PROVIDERS } from '../categories/categories.provider';
import { GENRE_PROVIDERS } from '../genres/genres.provider';
import ListVideoUseCase from '@core/video/application/usecases/list/list-video.use-case';

export const REPOSITORIES = {
    VIDEO_REPOSITORY: {
        provide: 'VideoRepository',
        useExisting: VideoSequelizeRepository,
    },

    VIDEO_MEMORY_REPOSITORY: {
        provide: VideoMemoryRepository,
        useClass: VideoMemoryRepository,
    },

    VIDEO_DATABASE_REPOSITORY: {
        provide: VideoSequelizeRepository,
        useFactory: (
            videoModel: typeof VideoModel,
            unitOfWork: SequelizeUnitOfWorkRepository,
        ) => new VideoSequelizeRepository(videoModel, unitOfWork),
        inject: [getModelToken(VideoModel), 'UnitOfWork'],
    },
};

export const USE_CASES = {
    CREATE_VIDEO_USE_CASE: {
        provide: CreateVideoUseCase,
        useFactory: (
            // applicatiounService: ApplicationService,
            unitOfWork: IUnitOfWork,
            videoRepository: IVideoRepository,
            categoriesIdsValidation: ICategoryIdsExistsInDatabaseValidation,
            genresIdsValidation: IGenresIdExistsInDatabaseValidation,
            castMembersIdsValidation: ICastMemberIdsExistsInDatabaseValidation,
        ) => {
            return new CreateVideoUseCase(
                unitOfWork,
                videoRepository,
                categoriesIdsValidation,
                genresIdsValidation,
                castMembersIdsValidation,
            );
        },
        inject: [
            'UnitOfWork',
            REPOSITORIES.VIDEO_REPOSITORY.provide,
            CATEGORY_PROVIDERS.VALIDATIONS
                .CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
            GENRE_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR
                .provide,
            CAST_MEMBER_PROVIDERS.VALIDATIONS
                .CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
        ],
    },

    UPDATE_VIDEO_USE_CASE: {
        provide: UpdateVideoUseCase,
        useFactory: (
            // applicatiounService: ApplicationService,
            unitOfWork: IUnitOfWork,
            videoRepository: IVideoRepository,
            categoriesIdsValidation: ICategoryIdsExistsInDatabaseValidation,
            genresIdsValidation: IGenresIdExistsInDatabaseValidation,
            castMembersIdsValidation: ICastMemberIdsExistsInDatabaseValidation,
        ) => {
            return new UpdateVideoUseCase(
                unitOfWork,
                videoRepository,
                categoriesIdsValidation,
                genresIdsValidation,
                castMembersIdsValidation,
            );
        },
        inject: [
            'UnitOfWork',
            REPOSITORIES.VIDEO_REPOSITORY.provide,
            CATEGORY_PROVIDERS.VALIDATIONS
                .CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
            GENRE_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR
                .provide,
            CAST_MEMBER_PROVIDERS.VALIDATIONS
                .CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
        ],
    },

    FIND_VIDEO_USE_CASE: {
        provide: FindVideoUseCase,
        useFactory: (
            videoRepository: IVideoRepository,
            genreRepository: IGenreRepository,
            categoryRepository: ICategoryRepository,
            castMemberRepository: ICastMemberRepository,
        ) =>
            new FindVideoUseCase(
                videoRepository,
                genreRepository,
                categoryRepository,
                castMemberRepository,
            ),
        inject: [
            REPOSITORIES.VIDEO_REPOSITORY.provide,
            GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
            CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
            CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        ],
    },

    LIST_VIDEO_USE_CASE: {
        provide: ListVideoUseCase,
        useFactory: (
            videoRepository: IVideoRepository,
            genreRepository: IGenreRepository,
            categoryRepository: ICategoryRepository,
            castMemberRepository: ICastMemberRepository,
        ) =>
            new ListVideoUseCase(
                videoRepository,
                genreRepository,
                categoryRepository,
                castMemberRepository,
            ),
        inject: [
            REPOSITORIES.VIDEO_REPOSITORY.provide,
            GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
            CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
            CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        ],
    },

    DELETE_VIDEO_USE_CASE: {
        provide: DeleteVideoUseCase,
        useFactory: (
            unitOfWork: IUnitOfWork,
            videoRepository: IVideoRepository,
        ) => new DeleteVideoUseCase(unitOfWork, videoRepository),
        inject: ['UnitOfWork', REPOSITORIES.VIDEO_REPOSITORY.provide],
    },

    UPLOAD_AUDIO_VIDEO_MEDIA_USE_CASE: {
        provide: UploadAudioVideoUseCase,
        useFactory: (
            applicationService: ApplicationService,
            storage: IStorage,
            videoRepository: IVideoRepository,
        ) => {
            return new UploadAudioVideoUseCase(
                applicationService,
                storage,
                videoRepository,
            );
        },
        inject: [
            ApplicationService,
            'Storage',
            REPOSITORIES.VIDEO_REPOSITORY.provide,
        ],
    },

    UPLOAD_IMAGE_MEDIA_USE_CASE: {
        provide: UploadImageUseCase,
        useFactory: (
            unitOfWork: IUnitOfWork,
            storage: IStorage,
            videoRepository: IVideoRepository,
        ) => {
            return new UploadImageUseCase(unitOfWork, storage, videoRepository);
        },
        inject: [
            'UnitOfWork',
            'Storage',
            REPOSITORIES.VIDEO_REPOSITORY.provide,
        ],
    },

    PROCESS_AUDIO_VIDEO_USE_CASE: {
        provide: ProcessAudioVideoUseCase,
        useFactory: (
            unitOfWork: IUnitOfWork,
            videoRepository: IVideoRepository,
        ) => {
            return new ProcessAudioVideoUseCase(unitOfWork, videoRepository);
        },
        inject: ['UnitOfWork', REPOSITORIES.VIDEO_REPOSITORY.provide],
    },
};

// export const HANDLERS = {
//     PUBLISH_VIDEO_IN_QUEUE_EVENT_HANDLER: {
//         provide: PublishVideoInQueueHandler,
//         useClass: PublishVideoInQueueHandler,
//     },
// };

export const VIDEO_PROVIDERS = {
    REPOSITORIES,
    USE_CASES,
    // VALIDATIONS,
    // HANDLERS,
};
