import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import ListVideoUseCase from './list-video.use-case';
import VideoMemoryRepository from '@core/video/infra/repositories/video-memory.repository';
import CategoryMemoryRepository from '@core/category/infra/repositories/category-memory.repository';
import GenreMemoryRepository from '@core/genre/infra/repositories/genre-memory.repository';
import CastMemberMemoryRepository from '@core/cast-member/infra/repositories/cast-member-memory.repository';
import IVideoRepository, {
    VideoSearchResult,
} from '@core/video/domain/video.repository.interface';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import Video from '@core/video/domain/video.aggregate';
import Rating from '@core/video/domain/video-rating.vo';

describe('ListGenre use case unit test', () => {
    let useCase: ListVideoUseCase;
    let videoRepository: IVideoRepository;
    let categoryRepository: ICategoryRepository;
    let genreRepository: IGenreRepository;
    let castMemberRepository: ICastMemberRepository;

    beforeEach(() => {
        videoRepository = new VideoMemoryRepository();
        genreRepository = new GenreMemoryRepository();
        categoryRepository = new CategoryMemoryRepository();
        castMemberRepository = new CastMemberMemoryRepository();
        useCase = new ListVideoUseCase(
            videoRepository,
            genreRepository,
            categoryRepository,
            castMemberRepository,
        );
    });

    test('Sem items', async () => {
        const result = new VideoSearchResult({
            items: [],
            currentPage: 1,
            perPage: 10,
            total: 0,
        });

        const output = await useCase['handle'](result);

        expect(output).toStrictEqual({
            items: [],
            currentPage: 1,
            perPage: 10,
            total: 0,
            lastPage: 0,
        });
    });

    test('Com items', async () => {
        const categories = Category.fake().theCategories(2).build();
        await categoryRepository.bulkInsert(categories);
        const genre = Genre.fake()
            .aGenre()
            .addCategoryId(categories[0].categoryId)
            .build();
        await genreRepository.insert(genre);
        const actor = CastMember.fake().anActor().build();
        const director = CastMember.fake().aDirector().build();
        await castMemberRepository.bulkInsert([actor, director]);
        const video = Video.fake()
            .aVideoWithoutMedias()
            .withTitle('Video')
            .withDescription('Video description')
            .withDuration(133)
            .withRating(Rating.createR16())
            .withMarkAsOpened()
            .withYearLaunched(2024)
            .build();
        video.syncGenresId([genre.genreId]);
        video.syncCategoriesId([categories[1].categoryId]);
        video.syncCastMembersId([actor.castMemberId, director.castMemberId]);
        await videoRepository.insert(video);

        const result = new VideoSearchResult({
            items: [video],
            currentPage: 1,
            perPage: 10,
            total: 1,
        });

        const output = await useCase['handle'](result);

        expect(output).toStrictEqual({
            items: [
                {
                    id: video.videoId.value,
                    title: 'Video',
                    description: 'Video description',
                    duration: 133,
                    rating: '16',
                    isOpened: true,
                    isPublished: false,
                    yearLaunched: 2024,
                    banner: null,
                    video: null,
                    trailer: null,
                    thumbnail: null,
                    thumbnailHalf: null,
                    categories: expect.arrayContaining([
                        {
                            id: categories[1].categoryId.value,
                            name: categories[1].name,
                            isActive: categories[1].isActive,
                        },
                        {
                            id: categories[0].categoryId.value,
                            name: categories[0].name,
                            isActive: categories[0].isActive,
                        },
                    ]),
                    castMembers: expect.arrayContaining([
                        {
                            id: actor.castMemberId.value,
                            name: actor.name,
                            type: actor.type.value,
                        },
                        {
                            id: director.castMemberId.value,
                            name: director.name,
                            type: director.type.value,
                        },
                    ]),
                    genres: expect.arrayContaining([
                        {
                            id: genre.genreId.value,
                            name: genre.name,
                        },
                    ]),
                    createdAt: video.createdAt,
                },
            ],
            currentPage: 1,
            perPage: 10,
            total: 1,
            lastPage: 1,
        });
    });

    describe('Ordenação', () => {
        test('Deve ordernar pelo createdAt quando o inputParams é vazio', async () => {
            const categories = Category.fake().theCategories(2).build();
            categoryRepository.bulkInsert(categories);
            const genre = Genre.fake()
                .aGenre()
                .addCategoryId(categories[0].categoryId)
                .build();
            genreRepository.insert(genre);
            const actor = CastMember.fake().anActor().build();
            const director = CastMember.fake().aDirector().build();
            castMemberRepository.bulkInsert([actor, director]);
            const date = new Date();

            const video1 = Video.fake()
                .aVideoWithoutMedias()
                .withTitle('Video')
                .withDescription('Video description')
                .withDuration(133)
                .withRating(Rating.createR16())
                .withMarkAsOpened()
                .withYearLaunched(2024)
                .withCreatedAt(new Date(date.getTime() + 200))
                .build();
            video1.syncGenresId([genre.genreId]);
            video1.syncCategoriesId([categories[1].categoryId]);
            video1.syncCastMembersId([
                actor.castMemberId,
                director.castMemberId,
            ]);
            const video2 = Video.fake()
                .aVideoWithoutMedias()
                .withTitle('Video')
                .withDescription('Video description')
                .withDuration(133)
                .withRating(Rating.createR16())
                .withMarkAsOpened()
                .withYearLaunched(2024)
                .withCreatedAt(new Date(date.getTime() + 300))
                .build();
            video2.syncGenresId([genre.genreId]);
            video2.syncCategoriesId([categories[1].categoryId]);
            video2.syncCastMembersId([
                actor.castMemberId,
                director.castMemberId,
            ]);
            const video3 = Video.fake()
                .aVideoWithoutMedias()
                .withTitle('Video')
                .withDescription('Video description')
                .withDuration(133)
                .withRating(Rating.createR16())
                .withMarkAsOpened()
                .withYearLaunched(2024)
                .withCreatedAt(new Date(date.getTime() + 100))
                .build();
            video3.syncGenresId([genre.genreId]);
            video3.syncCategoriesId([categories[1].categoryId]);
            video3.syncCastMembersId([
                actor.castMemberId,
                director.castMemberId,
            ]);
            videoRepository.bulkInsert([video1, video2, video3]);

            const output = await useCase.handle({});

            expect(output).toStrictEqual({
                items: [
                    {
                        id: video2.videoId.value,
                        title: 'Video',
                        description: 'Video description',
                        duration: 133,
                        rating: '16',
                        isOpened: true,
                        isPublished: false,
                        yearLaunched: 2024,
                        banner: null,
                        video: null,
                        trailer: null,
                        thumbnail: null,
                        thumbnailHalf: null,
                        categories: expect.arrayContaining([
                            {
                                id: categories[1].categoryId.value,
                                name: categories[1].name,
                                isActive: categories[1].isActive,
                            },
                            {
                                id: categories[0].categoryId.value,
                                name: categories[0].name,
                                isActive: categories[0].isActive,
                            },
                        ]),
                        castMembers: expect.arrayContaining([
                            {
                                id: actor.castMemberId.value,
                                name: actor.name,
                                type: actor.type.value,
                            },
                            {
                                id: director.castMemberId.value,
                                name: director.name,
                                type: director.type.value,
                            },
                        ]),
                        genres: expect.arrayContaining([
                            {
                                id: genre.genreId.value,
                                name: genre.name,
                            },
                        ]),
                        createdAt: video2.createdAt,
                    },
                    {
                        id: video1.videoId.value,
                        title: 'Video',
                        description: 'Video description',
                        duration: 133,
                        rating: '16',
                        isOpened: true,
                        isPublished: false,
                        yearLaunched: 2024,
                        banner: null,
                        video: null,
                        trailer: null,
                        thumbnail: null,
                        thumbnailHalf: null,
                        categories: expect.arrayContaining([
                            {
                                id: categories[1].categoryId.value,
                                name: categories[1].name,
                                isActive: categories[1].isActive,
                            },
                            {
                                id: categories[0].categoryId.value,
                                name: categories[0].name,
                                isActive: categories[0].isActive,
                            },
                        ]),
                        castMembers: expect.arrayContaining([
                            {
                                id: actor.castMemberId.value,
                                name: actor.name,
                                type: actor.type.value,
                            },
                            {
                                id: director.castMemberId.value,
                                name: director.name,
                                type: director.type.value,
                            },
                        ]),
                        genres: expect.arrayContaining([
                            {
                                id: genre.genreId.value,
                                name: genre.name,
                            },
                        ]),
                        createdAt: video1.createdAt,
                    },
                    {
                        id: video3.videoId.value,
                        title: 'Video',
                        description: 'Video description',
                        duration: 133,
                        rating: '16',
                        isOpened: true,
                        isPublished: false,
                        yearLaunched: 2024,
                        banner: null,
                        video: null,
                        trailer: null,
                        thumbnail: null,
                        thumbnailHalf: null,
                        categories: expect.arrayContaining([
                            {
                                id: categories[1].categoryId.value,
                                name: categories[1].name,
                                isActive: categories[1].isActive,
                            },
                            {
                                id: categories[0].categoryId.value,
                                name: categories[0].name,
                                isActive: categories[0].isActive,
                            },
                        ]),
                        castMembers: expect.arrayContaining([
                            {
                                id: actor.castMemberId.value,
                                name: actor.name,
                                type: actor.type.value,
                            },
                            {
                                id: director.castMemberId.value,
                                name: director.name,
                                type: director.type.value,
                            },
                        ]),
                        genres: expect.arrayContaining([
                            {
                                id: genre.genreId.value,
                                name: genre.name,
                            },
                        ]),
                        createdAt: video3.createdAt,
                    },
                ],
                total: 3,
                perPage: 15,
                lastPage: 1,
                currentPage: 1,
            });
        });
    });

    describe('Paginação', () => {
        test('Deve ordernar pelo createdAt quando o inputParams é vazio', async () => {
            const categories = Category.fake().theCategories(2).build();
            categoryRepository.bulkInsert(categories);
            const genre = Genre.fake()
                .aGenre()
                .addCategoryId(categories[0].categoryId)
                .build();
            genreRepository.insert(genre);
            const actor = CastMember.fake().anActor().build();
            const director = CastMember.fake().aDirector().build();
            castMemberRepository.bulkInsert([actor, director]);
            const date = new Date();

            const video1 = Video.fake()
                .aVideoWithoutMedias()
                .withTitle('Video')
                .withDescription('Video description')
                .withDuration(133)
                .withRating(Rating.createR16())
                .withMarkAsOpened()
                .withYearLaunched(2024)
                .withCreatedAt(new Date(date.getTime() + 200))
                .build();
            video1.syncGenresId([genre.genreId]);
            video1.syncCategoriesId([categories[1].categoryId]);
            video1.syncCastMembersId([
                actor.castMemberId,
                director.castMemberId,
            ]);
            const video2 = Video.fake()
                .aVideoWithoutMedias()
                .withTitle('Video')
                .withDescription('Video description')
                .withDuration(133)
                .withRating(Rating.createR16())
                .withMarkAsOpened()
                .withYearLaunched(2024)
                .withCreatedAt(new Date(date.getTime() + 300))
                .build();
            video2.syncGenresId([genre.genreId]);
            video2.syncCategoriesId([categories[1].categoryId]);
            video2.syncCastMembersId([
                actor.castMemberId,
                director.castMemberId,
            ]);
            const video3 = Video.fake()
                .aVideoWithoutMedias()
                .withTitle('Video')
                .withDescription('Video description')
                .withDuration(133)
                .withRating(Rating.createR16())
                .withMarkAsOpened()
                .withYearLaunched(2024)
                .withCreatedAt(new Date(date.getTime() + 100))
                .build();
            video3.syncGenresId([genre.genreId]);
            video3.syncCategoriesId([categories[1].categoryId]);
            video3.syncCastMembersId([
                actor.castMemberId,
                director.castMemberId,
            ]);
            videoRepository.bulkInsert([video1, video2, video3]);

            const outputFirstPage = await useCase.handle({
                page: 1,
                perPage: 1,
            });

            expect(outputFirstPage).toStrictEqual({
                items: [
                    {
                        id: video2.videoId.value,
                        title: 'Video',
                        description: 'Video description',
                        duration: 133,
                        rating: '16',
                        isOpened: true,
                        isPublished: false,
                        yearLaunched: 2024,
                        banner: null,
                        video: null,
                        trailer: null,
                        thumbnail: null,
                        thumbnailHalf: null,
                        categories: expect.arrayContaining([
                            {
                                id: categories[1].categoryId.value,
                                name: categories[1].name,
                                isActive: categories[1].isActive,
                            },
                            {
                                id: categories[0].categoryId.value,
                                name: categories[0].name,
                                isActive: categories[0].isActive,
                            },
                        ]),
                        castMembers: expect.arrayContaining([
                            {
                                id: actor.castMemberId.value,
                                name: actor.name,
                                type: actor.type.value,
                            },
                            {
                                id: director.castMemberId.value,
                                name: director.name,
                                type: director.type.value,
                            },
                        ]),
                        genres: expect.arrayContaining([
                            {
                                id: genre.genreId.value,
                                name: genre.name,
                            },
                        ]),
                        createdAt: video2.createdAt,
                    },
                ],
                total: 3,
                perPage: 1,
                lastPage: 3,
                currentPage: 1,
            });

            const outputSecondPage = await useCase.handle({
                page: 2,
                perPage: 1,
            });

            expect(outputSecondPage).toStrictEqual({
                items: [
                    {
                        id: video1.videoId.value,
                        title: 'Video',
                        description: 'Video description',
                        duration: 133,
                        rating: '16',
                        isOpened: true,
                        isPublished: false,
                        yearLaunched: 2024,
                        banner: null,
                        video: null,
                        trailer: null,
                        thumbnail: null,
                        thumbnailHalf: null,
                        categories: expect.arrayContaining([
                            {
                                id: categories[1].categoryId.value,
                                name: categories[1].name,
                                isActive: categories[1].isActive,
                            },
                            {
                                id: categories[0].categoryId.value,
                                name: categories[0].name,
                                isActive: categories[0].isActive,
                            },
                        ]),
                        castMembers: expect.arrayContaining([
                            {
                                id: actor.castMemberId.value,
                                name: actor.name,
                                type: actor.type.value,
                            },
                            {
                                id: director.castMemberId.value,
                                name: director.name,
                                type: director.type.value,
                            },
                        ]),
                        genres: expect.arrayContaining([
                            {
                                id: genre.genreId.value,
                                name: genre.name,
                            },
                        ]),
                        createdAt: video1.createdAt,
                    },
                ],
                total: 3,
                perPage: 1,
                lastPage: 3,
                currentPage: 2,
            });

            const thridSecondPage = await useCase.handle({
                page: 3,
                perPage: 1,
            });

            expect(thridSecondPage).toStrictEqual({
                items: [
                    {
                        id: video3.videoId.value,
                        title: 'Video',
                        description: 'Video description',
                        duration: 133,
                        rating: '16',
                        isOpened: true,
                        isPublished: false,
                        yearLaunched: 2024,
                        banner: null,
                        video: null,
                        trailer: null,
                        thumbnail: null,
                        thumbnailHalf: null,
                        categories: expect.arrayContaining([
                            {
                                id: categories[1].categoryId.value,
                                name: categories[1].name,
                                isActive: categories[1].isActive,
                            },
                            {
                                id: categories[0].categoryId.value,
                                name: categories[0].name,
                                isActive: categories[0].isActive,
                            },
                        ]),
                        castMembers: expect.arrayContaining([
                            {
                                id: actor.castMemberId.value,
                                name: actor.name,
                                type: actor.type.value,
                            },
                            {
                                id: director.castMemberId.value,
                                name: director.name,
                                type: director.type.value,
                            },
                        ]),
                        genres: expect.arrayContaining([
                            {
                                id: genre.genreId.value,
                                name: genre.name,
                            },
                        ]),
                        createdAt: video3.createdAt,
                    },
                ],
                total: 3,
                perPage: 1,
                lastPage: 3,
                currentPage: 3,
            });
        });
    });

    describe('Filtro', () => {
        test('Deve filtrar pelo nome', async () => {
            const categories = Category.fake().theCategories(2).build();
            categoryRepository.bulkInsert(categories);
            const genre = Genre.fake()
                .aGenre()
                .addCategoryId(categories[0].categoryId)
                .build();
            genreRepository.insert(genre);
            const actor = CastMember.fake().anActor().build();
            const director = CastMember.fake().aDirector().build();
            castMemberRepository.bulkInsert([actor, director]);
            const date = new Date();

            const video1 = Video.fake()
                .aVideoWithoutMedias()
                .withTitle('test')
                .withDescription('Video description')
                .withDuration(133)
                .withRating(Rating.createR16())
                .withMarkAsOpened()
                .withYearLaunched(2024)
                .withCreatedAt(new Date(date.getTime() + 200))
                .build();
            video1.syncGenresId([genre.genreId]);
            video1.syncCategoriesId([categories[1].categoryId]);
            video1.syncCastMembersId([
                actor.castMemberId,
                director.castMemberId,
            ]);
            const video2 = Video.fake()
                .aVideoWithoutMedias()
                .withTitle('TEST')
                .withDescription('Video description')
                .withDuration(133)
                .withRating(Rating.createR16())
                .withMarkAsOpened()
                .withYearLaunched(2024)
                .withCreatedAt(new Date(date.getTime() + 300))
                .build();
            video2.syncGenresId([genre.genreId]);
            video2.syncCategoriesId([categories[1].categoryId]);
            video2.syncCastMembersId([
                actor.castMemberId,
                director.castMemberId,
            ]);
            const video3 = Video.fake()
                .aVideoWithoutMedias()
                .withTitle('fake')
                .withDescription('Video description')
                .withDuration(133)
                .withRating(Rating.createR16())
                .withMarkAsOpened()
                .withYearLaunched(2024)
                .withCreatedAt(new Date(date.getTime() + 100))
                .build();
            video3.syncGenresId([genre.genreId]);
            video3.syncCategoriesId([categories[1].categoryId]);
            video3.syncCastMembersId([
                actor.castMemberId,
                director.castMemberId,
            ]);
            videoRepository.bulkInsert([video1, video2, video3]);

            const output = await useCase.handle({
                filter: { title: 'fake' },
            });

            expect(output).toStrictEqual({
                items: [
                    {
                        id: video3.videoId.value,
                        title: 'fake',
                        description: 'Video description',
                        duration: 133,
                        rating: '16',
                        isOpened: true,
                        isPublished: false,
                        yearLaunched: 2024,
                        banner: null,
                        video: null,
                        trailer: null,
                        thumbnail: null,
                        thumbnailHalf: null,
                        categories: expect.arrayContaining([
                            {
                                id: categories[1].categoryId.value,
                                name: categories[1].name,
                                isActive: categories[1].isActive,
                            },
                            {
                                id: categories[0].categoryId.value,
                                name: categories[0].name,
                                isActive: categories[0].isActive,
                            },
                        ]),
                        castMembers: expect.arrayContaining([
                            {
                                id: actor.castMemberId.value,
                                name: actor.name,
                                type: actor.type.value,
                            },
                            {
                                id: director.castMemberId.value,
                                name: director.name,
                                type: director.type.value,
                            },
                        ]),
                        genres: expect.arrayContaining([
                            {
                                id: genre.genreId.value,
                                name: genre.name,
                            },
                        ]),
                        createdAt: video3.createdAt,
                    },
                ],
                total: 1,
                perPage: 15,
                lastPage: 1,
                currentPage: 1,
            });
        });
    });
});
