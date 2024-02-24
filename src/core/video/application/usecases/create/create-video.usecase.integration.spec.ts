import Video from '@core/video/domain/video.aggregate';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import CreateVideoUseCase from './create-video.usecase';
import CategoriesIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.validation';
import GenresIdsExistsInDatabaseValidation from '@core/genre/application/validations/genres-ids-exists-in-database.validation';
import CastMembersIdsExistsInDatabaseValidation from '@core/cast-member/application/validations/cast-members-ids-exists-in-database.validation';
import Rating from '@core/video/domain/video-rating.vo';
import IExistsInDatabaseValidation from '@core/shared/application/validations/exists-in-database.interface';
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

describe('CreateVideoUseCase unit test', () => {
    const setupDatabase = setupDatabaseForVideo();
    let unitOfWork: SequelizeUnitOfWorkRepository;
    let useCase: CreateVideoUseCase;
    let videoRepository: IVideoRepository;
    let genreRepository: IGenreRepository;
    let categoryRepository: ICategoryRepository;
    let castMemberRepository: ICastMemberRepository;
    let categoriesIdsDatabaseValidation: IExistsInDatabaseValidation;
    let genresIdsDatabaseValidation: IExistsInDatabaseValidation;
    let castMembersIdsDatabaseValidation: IExistsInDatabaseValidation;

    beforeEach(() => {
        unitOfWork = new SequelizeUnitOfWorkRepository(setupDatabase.sequelize);
        categoryRepository = new CategorySequelizeRepository(CategoryModel);
        videoRepository = new VideoSequelizeRepository(VideoModel, unitOfWork);
        genreRepository = new GenreSequelizeRepository(GenreModel, unitOfWork);
        castMemberRepository = new CastMemberSequelizeRepository(
            CastMemberModel,
        );
        genresIdsDatabaseValidation = new GenresIdsExistsInDatabaseValidation(
            genreRepository,
        );
        categoriesIdsDatabaseValidation =
            new CategoriesIdsExistsInDatabaseValidation(categoryRepository);
        castMembersIdsDatabaseValidation =
            new CastMembersIdsExistsInDatabaseValidation(castMemberRepository);
        useCase = new CreateVideoUseCase(
            unitOfWork,
            videoRepository,
            categoriesIdsDatabaseValidation,
            genresIdsDatabaseValidation,
            castMembersIdsDatabaseValidation,
        );
    });

    test.only('Deve criar um vídeo', async () => {
        const categories = Category.fake().theCategories(2).build();
        await categoryRepository.bulkInsert(categories);
        const genre = Genre.fake()
            .aGenre()
            .addCategoryId(categories[0].categoryId)
            .build();
        await genreRepository.insert(genre);
        const castMember = CastMember.fake().aDirector().build();
        await castMemberRepository.insert(castMember);

        const spyVideoInsert = jest.spyOn(videoRepository, 'insert');
        const spyGenresIdValidation = jest.spyOn(
            genresIdsDatabaseValidation,
            'validate',
        );
        const spyCategoriesIdValidation = jest.spyOn(
            categoriesIdsDatabaseValidation,
            'validate',
        );
        const spyCastMembersIdValidation = jest.spyOn(
            castMembersIdsDatabaseValidation,
            'validate',
        );

        const video = Video.fake()
            .aVideoWithAllMedias()
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .addCategoryId(categories[1].categoryId)
            .build();
        await videoRepository.insert(video);

        const output = await useCase.handle({
            title: video.title,
            description: video.description,
            duration: video.duration,
            isOpened: video.isOpened,
            yearLaunched: video.yearLaunched,
            rating: Rating.createRL().value,
            genresId: Array.from(video.genresId.values()).map((i) => i.value),
            categoriesId: Array.from(video.categoriesId.values()).map(
                (i) => i.value,
            ),
            castMembersId: Array.from(video.castMembersId.values()).map(
                (i) => i.value,
            ),
        });

        expect(spyVideoInsert).toHaveBeenCalled();
        expect(spyGenresIdValidation).toHaveBeenCalled();
        expect(spyCategoriesIdValidation).toHaveBeenCalled();
        expect(spyCastMembersIdValidation).toHaveBeenCalled();
        expect(output.id).toBeDefined();
        // expect(output.id).toStrictEqual({
        //     id: video.videoId.value,
        //     title: video.title,
        //     description: video.description,
        //     duration: video.duration,
        //     yearLaunched: video.yearLaunched,
        //     isOpened: video.isOpened,
        //     rating: video.rating.value,
        //     banner: video.banner!.url,
        //     thumbnail: video.thumbnail!.url,
        //     thumbnailHalf: video.thumbnailHalf!.url,
        //     video: video.video!.url,
        //     trailer: video.trailer!.url,
        //     genres: expect.arrayContaining([
        //         {
        //             id: genre.genreId.value,
        //             name: genre.name,
        //         },
        //     ]),
        //     castMembers: expect.arrayContaining([
        //         {
        //             id: castMember.castMemberId.value,
        //             name: castMember.name,
        //             type: castMember.type.value,
        //         },
        //     ]),
        //     categories: expect.arrayContaining([
        //         {
        //             id: categories[0].categoryId.value,
        //             name: categories[0].name,
        //             isActive: categories[0].isActive,
        //         },
        //         {
        //             id: categories[1].categoryId.value,
        //             name: categories[1].name,
        //             isActive: categories[1].isActive,
        //         },
        //     ]),
        //     createdAt: video.createdAt,
        // });
    });
});
