import FindVideoUseCase from './find-video.usecase';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';
import Video, { VideoId } from '@core/video/domain/video.aggregate';
import VideoNotFoundError from '@core/video/domain/errors/video-not-found.error';
import { setupDatabaseForVideo } from '@core/video/infra/database/setup-database';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import VideoSequelizeRepository from '@core/video/infra/repositories/video-sequelize.repository';
import VideoModel from '@core/video/infra/database/sequelize/models/video.model';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import GenreSequelizeRepository from '@core/genre/infra/repositories/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/database/sequelize/models/genre.model';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import CastMemberSequelizeRepository from '@core/cast-member/infra/repositories/cast-member-sequelize.repository';
import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';

describe('FindVideoUseCase unit test', () => {
    const databaseHelper = setupDatabaseForVideo();

    let useCase: FindVideoUseCase;
    let unitOfWork: IUnitOfWork;
    let videoRepository: IVideoRepository;
    let genreRepository: IGenreRepository;
    let categoryRepository: ICategoryRepository;
    let castMemberRepository: ICastMemberRepository;

    beforeEach(() => {
        unitOfWork = new SequelizeUnitOfWorkRepository(
            databaseHelper.sequelize,
        );
        videoRepository = new VideoSequelizeRepository(
            VideoModel,
            unitOfWork as SequelizeUnitOfWorkRepository,
        );
        genreRepository = new GenreSequelizeRepository(
            GenreModel,
            unitOfWork as SequelizeUnitOfWorkRepository,
        );
        categoryRepository = new CategorySequelizeRepository(CategoryModel);
        castMemberRepository = new CastMemberSequelizeRepository(
            CastMemberModel,
        );
        useCase = new FindVideoUseCase(
            videoRepository,
            genreRepository,
            categoryRepository,
            castMemberRepository,
        );
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

    test.only('Deve retornar um vídeo', async () => {
        const categories = Category.fake().theCategories(2).build();
        await categoryRepository.bulkInsert(categories);
        const genre = Genre.fake()
            .aGenre()
            .addCategoryId(categories[0].categoryId)
            .build();
        await genreRepository.insert(genre);
        const castMember = CastMember.fake().aDirector().build();
        await castMemberRepository.insert(castMember);

        const spyVideoFindById = jest.spyOn(videoRepository, 'findById');
        const spyGenreFindByIds = jest.spyOn(genreRepository, 'findByIds');
        const spyCategoryFindByIds = jest.spyOn(
            categoryRepository,
            'findByIds',
        );
        const spyCastMemberFindByIds = jest.spyOn(
            castMemberRepository,
            'findByIds',
        );

        const video = Video.fake()
            .aVideoWithAllMedias()
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .addCategoryId(categories[1].categoryId)
            .build();
        await videoRepository.insert(video);

        const output = await useCase.handle({ id: video.videoId.value });

        expect(spyVideoFindById).toHaveBeenCalled();
        expect(spyGenreFindByIds).toHaveBeenCalled();
        expect(spyCategoryFindByIds).toHaveBeenCalled();
        expect(spyCastMemberFindByIds).toHaveBeenCalled();
        expect(output).toStrictEqual({
            id: video.videoId.value,
            title: video.title,
            description: video.description,
            duration: video.duration,
            yearLaunched: video.yearLaunched,
            rating: video.rating.value,
            isOpened: true,
            isPublished: false,
            banner: video.banner!.url,
            thumbnail: video.thumbnail!.url,
            thumbnailHalf: video.thumbnailHalf!.url,
            video: video.video!.url,
            trailer: video.trailer!.url,
            genres: expect.arrayContaining([
                {
                    id: genre.genreId.value,
                    name: genre.name,
                },
            ]),
            castMembers: expect.arrayContaining([
                {
                    id: castMember.castMemberId.value,
                    name: castMember.name,
                    type: castMember.type.value,
                },
            ]),
            categories: expect.arrayContaining([
                {
                    id: categories[0].categoryId.value,
                    name: categories[0].name,
                    isActive: categories[0].isActive,
                },
                {
                    id: categories[1].categoryId.value,
                    name: categories[1].name,
                    isActive: categories[1].isActive,
                },
            ]),
            createdAt: video.createdAt,
        });
    });
});
