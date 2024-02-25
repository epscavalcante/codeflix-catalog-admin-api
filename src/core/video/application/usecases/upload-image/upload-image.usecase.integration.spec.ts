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
import UploadImageUseCase from './upload-image.usecase';
import { ImageMediaRelatedField } from '@core/video/infra/database/sequelize/models/video-image-media.model';
import MediaFileMimeTypeError from '@core/shared/domain/errors/media-file-mime-type.error';
import VideoBanner from '@core/video/domain/video-banner.vo';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import MediaFileSizeError from '@core/shared/domain/errors/media-file-size.error';

const setupDatabase = setupDatabaseForVideo();
let unitOfWork: SequelizeUnitOfWorkRepository;
let useCase: UploadImageUseCase;
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
        categoryRepository = new CategorySequelizeRepository(CategoryModel);
        videoRepository = new VideoSequelizeRepository(VideoModel, unitOfWork);
        genreRepository = new GenreSequelizeRepository(GenreModel, unitOfWork);
        castMemberRepository = new CastMemberSequelizeRepository(
            CastMemberModel,
        );
        useCase = new UploadImageUseCase(unitOfWork, storage, videoRepository);
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

    test('Deve lançar erro quando enviar um mimetype não válido.', async () => {
        const video = await createVideo();
        const data = {
            videoId: video.videoId.value,
            videoField: ImageMediaRelatedField.BANNER,
            file: {
                rawName: 'test',
                mimeType: 'text/plain',
                size: 1,
                data: Buffer.from(''),
            },
        };

        const mimeTypeError = new MediaFileMimeTypeError(
            data.file.mimeType,
            VideoBanner.MIME_TYPES,
        );

        await expect(() => useCase.handle(data)).rejects.toThrow(
            new EntityValidationError([
                {
                    [ImageMediaRelatedField.BANNER]: [mimeTypeError.message],
                },
            ]),
        );
    });

    test('Deve lançar erro quando enviar size inválido.', async () => {
        const video = await createVideo();
        const data = {
            videoId: video.videoId.value,
            videoField: ImageMediaRelatedField.BANNER,
            file: {
                rawName: 'test',
                mimeType: 'text/plain',
                size: VideoBanner.MAX_SIZE + 1,
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
                    [ImageMediaRelatedField.BANNER]: [mimeTypeError.message],
                },
            ]),
        );
    });

    test('Deve fazer upload de uma imagem do vídeo', async () => {
        const video = await createVideo();
        const spyStoragePut = jest.spyOn(storage, 'put');
        const spyVideoUpdate = jest.spyOn(videoRepository, 'update');
        const data = {
            videoId: video.videoId.value,
            videoField: ImageMediaRelatedField.BANNER,
            file: {
                rawName: 'test.jpg',
                mimeType: 'image/jpeg',
                size: 100,
                data: Buffer.from(''),
            },
        };

        await useCase.handle(data);

        expect(spyVideoUpdate).toHaveBeenCalled();
        const videoUpdated = await videoRepository.findById(video.videoId);
        expect(videoUpdated!.banner).toBeDefined();
        expect(videoUpdated!.banner?.name.includes('.jpg')).toBeTruthy();
        expect(videoUpdated!.banner?.location).toBe(
            `videos/${videoUpdated!.videoId.value}/images`,
        );
        expect(spyStoragePut).toHaveBeenCalled();
        expect(spyStoragePut).toHaveBeenCalledWith({
            file: Buffer.from(''),
            id: videoUpdated!.banner!.url,
            mimeType: 'image/jpeg',
        });

        const fileStoraged = await storage.get(videoUpdated!.banner!.url);
        expect(fileStoraged).toBeDefined();
        expect(fileStoraged.mimeType).toBe('image/jpeg');
    });
});
