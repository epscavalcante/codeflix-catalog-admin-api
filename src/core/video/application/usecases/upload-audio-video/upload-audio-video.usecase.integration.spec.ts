import Video, { VideoId } from '@core/video/domain/video.aggregate';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import GenreSequelizeRepository from '@core/genre/infra/repositories/genre-sequelize.repository';
import CastMemberSequelizeRepository from '@core/cast-member/infra/repositories/cast-member-sequelize.repository';
import { setupDatabaseForVideo } from '@core/video/infra/database/setup-database';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import { GenreModel } from '@core/genre/infra/database/sequelize/models/genre.model';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import VideoSequelizeRepository from '@core/video/infra/repositories/video-sequelize.repository';
import VideoModel from '@core/video/infra/database/sequelize/models/video.model';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';
import VideoNotFoundError from '@core/video/domain/errors/video-not-found.error';
import IStorage from '@core/shared/domain/storage.interface';
import MemoryStorage from '@core/shared/infra/storage/memory.storage';
import MediaFileMimeTypeError from '@core/shared/domain/errors/media-file-mime-type.error';
import VideoBanner from '@core/video/domain/video-banner.vo';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import MediaFileSizeError from '@core/shared/domain/errors/media-file-size.error';
import UploadAudioVideoUseCase from './upload-audio-video.usecase';
import { AudioVideoMediaRelatedField } from '@core/video/infra/database/sequelize/models/video-audio-media.model';
import VideoTrailer from '@core/video/domain/video-trailer.vo';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import ApplicationService from '@core/shared/application/application.service';
import DomainEventMediator from '@core/shared/domain/domain-events/domain-event.mediator';
import EventEmitter2 from 'eventemitter2';

const setupDatabase = setupDatabaseForVideo();
let unitOfWork: SequelizeUnitOfWorkRepository;
let applicationService: ApplicationService;
let useCase: UploadAudioVideoUseCase;
let storage: IStorage;
let videoRepository: IVideoRepository;
let genreRepository: IGenreRepository;
let categoryRepository: ICategoryRepository;
let castMemberRepository: ICastMemberRepository;

async function createVideo(): Promise<Video> {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepository.bulkInsert(categories);
    const genre = Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].categoryId)
        .build();
    await genreRepository.insert(genre);
    const castMember = CastMember.fake().aDirector().build();
    await castMemberRepository.insert(castMember);

    const video = Video.fake()
        .aVideoWithoutMedias()
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .addCategoryId(categories[1].categoryId)
        .build();
    await videoRepository.insert(video);
    return video;
}

describe('UpdateVideoUseCase integration test', () => {
    beforeEach(() => {
        storage = new MemoryStorage();
        unitOfWork = new SequelizeUnitOfWorkRepository(setupDatabase.sequelize);
        applicationService = new ApplicationService(
            unitOfWork,
            new DomainEventMediator(new EventEmitter2()),
        );
        categoryRepository = new CategorySequelizeRepository(CategoryModel);
        videoRepository = new VideoSequelizeRepository(VideoModel, unitOfWork);
        genreRepository = new GenreSequelizeRepository(GenreModel, unitOfWork);
        castMemberRepository = new CastMemberSequelizeRepository(
            CastMemberModel,
        );
        useCase = new UploadAudioVideoUseCase(
            applicationService,
            storage,
            videoRepository,
        );
    });

    test('Deve lançar InvalidUuidExeception com id fake', async () => {
        await expect(() =>
            useCase.handle({ videoId: 'fake' } as any),
        ).rejects.toThrow(new InvalidUuidException());
    });

    test('Deve lançar EntiityNotFoundExeception pq video não foi encontrada.', async () => {
        const uuid = new VideoId();

        await expect(() =>
            useCase.handle({ videoId: uuid.value } as any),
        ).rejects.toThrow(new VideoNotFoundError(uuid.value));
    });

    test('Deve lançar erro quando enviar size inválido.', async () => {
        const video = await createVideo();
        const data = {
            videoId: video.videoId.value,
            videoField: AudioVideoMediaRelatedField.TRAILER,
            file: {
                rawName: 'test',
                mimeType: 'text/plain',
                size: VideoTrailer.MAX_SIZE + 1,
                data: Buffer.from(''),
            },
        };

        const mimeTypeError = new MediaFileSizeError(
            data.file.size,
            VideoBanner.MAX_SIZE,
        );

        await expect(() => useCase.handle(data)).rejects.toThrow(
            new EntityValidationError([
                {
                    [AudioVideoMediaRelatedField.TRAILER]: [
                        mimeTypeError.message,
                    ],
                },
            ]),
        );
    });

    test('Deve lançar erro quando enviar um mimetype inválido.', async () => {
        const video = await createVideo();
        const data = {
            videoId: video.videoId.value,
            videoField: AudioVideoMediaRelatedField.TRAILER,
            file: {
                rawName: 'test',
                mimeType: 'text/plain',
                size: 1,
                data: Buffer.from(''),
            },
        };

        const mimeTypeError = new MediaFileMimeTypeError(
            data.file.mimeType,
            VideoTrailer.MIME_TYPES,
        );

        await expect(() => useCase.handle(data)).rejects.toThrow(
            new EntityValidationError([
                {
                    [AudioVideoMediaRelatedField.TRAILER]: [
                        mimeTypeError.message,
                    ],
                },
            ]),
        );
    });

    test('Deve fazer upload video media do vídeo', async () => {
        const video = await createVideo();
        const spyStoragePut = jest.spyOn(storage, 'put');
        const spyVideoUpdate = jest.spyOn(videoRepository, 'update');
        const data = {
            videoId: video.videoId.value,
            videoField: AudioVideoMediaRelatedField.TRAILER,
            file: {
                rawName: 'test-trailer.mp4',
                mimeType: 'video/mp4',
                size: 100,
                data: Buffer.from(''),
            },
        };

        await useCase.handle(data);

        expect(spyVideoUpdate).toHaveBeenCalled();
        const videoUpdated = await videoRepository.findById(video.videoId);
        expect(videoUpdated!.trailer).toBeDefined();
        expect(videoUpdated!.trailer?.name.includes('.mp4')).toBeTruthy();
        expect(videoUpdated!.trailer?.status).toBe(
            AudioVideoMediaStatus.PENDING,
        );
        expect(videoUpdated!.trailer?.rawLocation).toBe(
            `videos/${videoUpdated!.videoId.value}/trailers`,
        );
        expect(videoUpdated!.trailer?.encodedLocation).toBeNull();
        expect(spyStoragePut).toHaveBeenCalled();
        expect(spyStoragePut).toHaveBeenCalledWith({
            file: Buffer.from(''),
            id: videoUpdated!.trailer!.url,
            mimeType: 'video/mp4',
        });

        const fileStoraged = await storage.get(videoUpdated!.trailer!.url);
        expect(fileStoraged).toBeDefined();
        expect(fileStoraged.mimeType).toBe('video/mp4');
    });
});
