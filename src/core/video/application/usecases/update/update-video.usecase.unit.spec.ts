import Video, { VideoId } from '@core/video/domain/video.aggregate';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import CategoriesIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.validation';
import GenresIdsExistsInDatabaseValidation from '@core/genre/application/validations/genres-ids-exists-in-database.validation';
import CastMembersIdsExistsInDatabaseValidation from '@core/cast-member/application/validations/cast-members-ids-exists-in-database.validation';
import Rating from '@core/video/domain/video-rating.vo';
import ICategoryIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.interface';
import IGenresIdExistsInDatabaseValidation from '@core/genre/application/validations/genres-ids-exists-in-database.interface';
import ICastMemberIdsExistsInDatabaseValidation from '@core/cast-member/application/validations/cast-members-ids-exists-in-database.interface';
import UpdateVideoUseCase from './update-video.usecase';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';
import VideoNotFoundError from '@core/video/domain/errors/video-not-found.error';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';
import MemoryUnitOfWorkRepository from '@core/shared/infra/repositories/memory-unit-of-work.repository';
import CategoryMemoryRepository from '@core/category/infra/repositories/category-memory.repository';
import VideoMemoryRepository from '@core/video/infra/repositories/video-memory.repository';
import GenreMemoryRepository from '@core/genre/infra/repositories/genre-memory.repository';
import CastMemberMemoryRepository from '@core/cast-member/infra/repositories/cast-member-memory.repository';

describe('UpdateVideoUseCase unit test', () => {
    let unitOfWork: IUnitOfWork;
    let useCase: UpdateVideoUseCase;
    let videoRepository: IVideoRepository;
    let genreRepository: IGenreRepository;
    let categoryRepository: ICategoryRepository;
    let castMemberRepository: ICastMemberRepository;
    let categoriesIdsDatabaseValidation: ICategoryIdsExistsInDatabaseValidation;
    let genresIdsDatabaseValidation: IGenresIdExistsInDatabaseValidation;
    let castMembersIdsDatabaseValidation: ICastMemberIdsExistsInDatabaseValidation;

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
        useCase = new UpdateVideoUseCase(
            unitOfWork,
            videoRepository,
            categoriesIdsDatabaseValidation,
            genresIdsDatabaseValidation,
            castMembersIdsDatabaseValidation,
        );
    });

    test('Deve lançar InvalidUuidExeception com id fake', async () => {
        await expect(() =>
            useCase.handle({ id: 'fake' } as any),
        ).rejects.toThrow(new InvalidUuidException());
    });

    test('Deve lançar EntiityNotFoundExeception pq video não foi encontrada.', async () => {
        const uuid = new VideoId();

        await expect(() =>
            useCase.handle({ id: uuid.value } as any),
        ).rejects.toThrow(new VideoNotFoundError(uuid.value));
    });

    test('Deve criar um vídeo', async () => {
        const categoriesInsert = Category.fake().theCategories(2).build();
        const categoriesUpdate = Category.fake().theCategories(2).build();
        await categoryRepository.bulkInsert([
            ...categoriesInsert,
            ...categoriesUpdate,
        ]);
        const genreInsert = Genre.fake()
            .aGenre()
            .addCategoryId(categoriesInsert[0].categoryId)
            .build();
        const genreUpdate = Genre.fake()
            .aGenre()
            .addCategoryId(categoriesUpdate[0].categoryId)
            .build();
        await genreRepository.bulkInsert([genreInsert, genreUpdate]);
        const castMemberInsert = CastMember.fake().aDirector().build();
        const castMemberUpdate = CastMember.fake().anActor().build();
        await castMemberRepository.bulkInsert([
            castMemberInsert,
            castMemberUpdate,
        ]);

        const video = Video.fake()
            .aVideoWithoutMedias()
            .addGenreId(genreInsert.genreId)
            .addCastMemberId(castMemberInsert.castMemberId)
            .addCategoryId(categoriesInsert[1].categoryId)
            .withMarkAsNotOpened()
            .withRating(Rating.createRL())
            .build();

        await videoRepository.insert(video);

        video.syncGenresId([genreUpdate.genreId]);
        video.syncCategoriesId(categoriesUpdate.map((c) => c.categoryId));
        video.syncCastMembersId([castMemberUpdate.castMemberId]);
        video.changeTitle('video updated');
        video.changeDescription('description updated');
        video.changeDuration(666);
        video.changeYearLaunched(2030);
        video.changeRating(Rating.createR18());
        video.markAsOpened();

        const spyVideoUpdate = jest.spyOn(videoRepository, 'update');
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

        const output = await useCase.handle({
            id: video.videoId.value,
            title: video.title,
            description: video.description,
            duration: video.duration,
            isOpened: video.isOpened,
            yearLaunched: video.yearLaunched,
            rating: video.rating.value,
            genresId: Array.from(video.genresId.values()).map((i) => i.value),
            categoriesId: Array.from(video.categoriesId.values()).map(
                (i) => i.value,
            ),
            castMembersId: Array.from(video.castMembersId.values()).map(
                (i) => i.value,
            ),
        });

        expect(spyVideoUpdate).toHaveBeenCalled();
        expect(spyGenresIdValidation).toHaveBeenCalled();
        expect(spyCategoriesIdValidation).toHaveBeenCalled();
        expect(spyCastMembersIdValidation).toHaveBeenCalled();

        expect(output.id).toBeDefined();

        const videoUpdated = await videoRepository.findById(video.videoId);
        expect(videoUpdated!.toJSON()).toMatchObject(
            expect.objectContaining(video.toJSON()),
        );
    });
});
