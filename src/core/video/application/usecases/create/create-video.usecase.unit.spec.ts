import Video from '@core/video/domain/video.aggregate';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import VideoMemoryRepository from '@core/video/infra/repositories/video-memory.repository';
import GenreMemoryRepository from '@core/genre/infra/repositories/genre-memory.repository';
import CategoryMemoryRepository from '@core/category/infra/repositories/category-memory.repository';
import CreateVideoUseCase from './create-video.usecase';
import CategoriesIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.validation';
import GenresIdsExistsInDatabaseValidation from '@core/genre/application/validations/genres-ids-exists-in-database.validation';
import CastMembersIdsExistsInDatabaseValidation from '@core/cast-member/application/validations/cast-members-ids-exists-in-database.validation';
import Rating from '@core/video/domain/video-rating.vo';
import CastMemberMemoryRepository from '@core/cast-member/infra/repositories/cast-member-memory.repository';
import MemoryUnitOfWorkRepository from '@core/shared/infra/repositories/memory-unit-of-work.repository';
import IExistsInDatabaseValidation from '@core/shared/application/validations/exists-in-database.interface';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';

describe('CreateVideoUseCase unit test', () => {
    let unitOfWork: IUnitOfWork;
    let useCase: CreateVideoUseCase;
    let videoRepository: IVideoRepository;
    let genreRepository: IGenreRepository;
    let categoryRepository: ICategoryRepository;
    let castMemberRepository: ICastMemberRepository;
    let categoriesIdsDatabaseValidation: IExistsInDatabaseValidation;
    let genresIdsDatabaseValidation: IExistsInDatabaseValidation;
    let castMembersIdsDatabaseValidation: IExistsInDatabaseValidation;

    beforeEach(() => {
        unitOfWork = new MemoryUnitOfWorkRepository();
        categoryRepository = new CategoryMemoryRepository();
        videoRepository = new VideoMemoryRepository();
        genreRepository = new GenreMemoryRepository();
        castMemberRepository = new CastMemberMemoryRepository();
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
