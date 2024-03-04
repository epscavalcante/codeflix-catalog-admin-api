import Video, { VideoId } from '@core/video/domain/video.aggregate';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import DeleteVideoUseCase from './delete-video.usecase';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';
import VideoNotFoundError from '@core/video/domain/errors/video-not-found.error';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import { setupDatabaseForVideo } from '@core/video/infra/database/setup-database';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import VideoModel, {
    VideoCastMemberModel,
    VideoCategoryModel,
    VideoGenreModel,
} from '@core/video/infra/database/sequelize/models/video.model';
import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import VideoSequelizeRepository from '@core/video/infra/repositories/video-sequelize.repository';
import GenreSequelizeRepository from '@core/genre/infra/repositories/genre-sequelize.repository';
import CastMemberSequelizeRepository from '@core/cast-member/infra/repositories/cast-member-sequelize.repository';
import { GenreModel } from '@core/genre/infra/database/sequelize/models/genre.model';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import VideoImageMediaModel from '@core/video/infra/database/sequelize/models/video-image-media.model';
import AudioVideoMediaModel from '@core/video/infra/database/sequelize/models/video-audio-media.model';

describe('DeleteVideoUseCase integration test', () => {
    const setupDatabase = setupDatabaseForVideo();
    let unitOfWork: SequelizeUnitOfWorkRepository;
    let useCase: DeleteVideoUseCase;
    let videoRepository: IVideoRepository;
    let genreRepository: IGenreRepository;
    let categoryRepository: ICategoryRepository;
    let castMemberRepository: ICastMemberRepository;

    beforeEach(() => {
        unitOfWork = new SequelizeUnitOfWorkRepository(setupDatabase.sequelize);
        categoryRepository = new CategorySequelizeRepository(CategoryModel);
        videoRepository = new VideoSequelizeRepository(VideoModel, unitOfWork);
        genreRepository = new GenreSequelizeRepository(GenreModel, unitOfWork);
        castMemberRepository = new CastMemberSequelizeRepository(
            CastMemberModel,
        );
        useCase = new DeleteVideoUseCase(unitOfWork, videoRepository);
    });

    test('Deve lançar InvalidUuidExeception com id fake', async () => {
        await expect(() => useCase.handle({ id: 'fake' })).rejects.toThrow(
            new InvalidUuidException(),
        );
    });

    test('Deve lançar EntiityNotFoundExeception pq video não foi encontrada.', async () => {
        const uuid = new VideoId();

        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(
            new VideoNotFoundError(uuid.value),
        );
    });

    test('Deve criar um vídeo', async () => {
        const categories = Category.fake().theCategories(2).build();
        await categoryRepository.bulkInsert(categories);
        const genre = Genre.fake()
            .aGenre()
            .addCategoryId(categories[0].categoryId)
            .build();
        await genreRepository.insert(genre);
        const castMember = CastMember.fake().aDirector().build();
        await castMemberRepository.insert(castMember);

        const spyVideoDelete = jest.spyOn(videoRepository, 'delete');

        const video = Video.fake()
            .aVideoWithAllMedias()
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .addCategoryId(categories[1].categoryId)
            .build();
        await videoRepository.insert(video);

        await useCase.handle({
            id: video.videoId.value,
        });

        expect(spyVideoDelete).toHaveBeenCalledTimes(1);
        const videoExist = await videoRepository.findById(video.videoId);

        expect(videoExist).toBeNull();
        await expect(VideoCategoryModel.count()).resolves.toBe(0);
        await expect(VideoGenreModel.count()).resolves.toBe(0);
        await expect(VideoCastMemberModel.count()).resolves.toBe(0);
        await expect(VideoImageMediaModel.count()).resolves.toBe(0);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
    });
});
