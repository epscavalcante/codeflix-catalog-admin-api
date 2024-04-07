import request from 'supertest';
import { startApp } from '../helpers/start-app';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import { VIDEO_PROVIDERS } from '../../src/videos/videos.providers';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import { GENRE_PROVIDERS } from '../../src/genres/genres.provider';
import { CAST_MEMBER_PROVIDERS } from '../../src/cast-members/cast-members.provider';
import { CATEGORY_PROVIDERS } from '../../src/categories/categories.provider';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import Video from '@core/video/domain/video.aggregate';
import Rating from '@core/video/domain/video-rating.vo';

describe('VideosController (e2e)', () => {
    const appHelper = startApp();

    let videoRepository: IVideoRepository;
    let genreRepository: IGenreRepository;
    let categoryRepository: ICategoryRepository;
    let castMemberRepository: ICastMemberRepository;

    beforeEach(async () => {
        videoRepository = appHelper.app.get<IVideoRepository>(
            VIDEO_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
        );
        genreRepository = appHelper.app.get<IGenreRepository>(
            GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        categoryRepository = appHelper.app.get<ICategoryRepository>(
            CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        castMemberRepository = appHelper.app.get<ICastMemberRepository>(
            CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
    });

    describe('GET /videos', () => {
        test('should return empty list', async () => {
            const response = await request(appHelper.app.getHttpServer())
                .get('/videos')
                .expect(200);

            expect(response.body).toMatchObject({
                meta: {
                    currentPage: 1,
                    perPage: 15,
                    lastPage: 0,
                    total: 0,
                },
            });
        });

        describe('Pagination, Ordering and search', () => {
            beforeEach(async () => {
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
                await videoRepository.bulkInsert([video1, video2, video3]);
            });

            test('should list of videos', async () => {
                const response = await request(appHelper.app.getHttpServer())
                    .get('/videos')
                    .expect(200);
                expect(response.body).toMatchObject({
                    meta: {
                        currentPage: 1,
                        perPage: 15,
                        lastPage: 1,
                        total: 3,
                    },
                });
            });

            test('should paginate data', async () => {
                let response = await request(appHelper.app.getHttpServer())
                    .get('/videos?page=1&perPage=1')
                    .expect(200);
                expect(response.body).toMatchObject({
                    meta: {
                        currentPage: 1,
                        perPage: 1,
                        lastPage: 3,
                        total: 3,
                    },
                });

                response = await request(appHelper.app.getHttpServer())
                    .get('/videos?page=2&perPage=1')
                    .expect(200);
                expect(response.body).toMatchObject({
                    meta: {
                        currentPage: 2,
                        perPage: 1,
                        lastPage: 3,
                        total: 3,
                    },
                });

                response = await request(appHelper.app.getHttpServer())
                    .get('/videos?page=3&perPage=1')
                    .expect(200);
                expect(response.body).toMatchObject({
                    meta: {
                        currentPage: 3,
                        perPage: 1,
                        lastPage: 3,
                        total: 3,
                    },
                });
            });

            describe('Should find a video', () => {
                test('ok', async () => {
                    const category = Category.fake().aCategory().build();
                    const category2 = Category.fake().aCategory().build();
                    const genre = Genre.fake()
                        .aGenre()
                        .addCategoryId(category.categoryId)
                        .build();
                    const castMemberDirector = CastMember.fake()
                        .aDirector()
                        .build();
                    const castMemberActor = CastMember.fake().anActor().build();
                    await await Promise.all([
                        categoryRepository.bulkInsert([category, category2]),
                        genreRepository.insert(genre),
                        castMemberRepository.bulkInsert([
                            castMemberActor,
                            castMemberDirector,
                        ]),
                    ]);

                    const video = Video.fake()
                        .aVideoWithoutMedias()
                        .withTitle('Video')
                        .withDescription('Video description')
                        .withDuration(133)
                        .withYearLaunched(2024)
                        .withRating(Rating.createR16())
                        .withMarkAsOpened()
                        .build();
                    video.syncCategoriesId([category2.categoryId]);
                    video.syncGenresId([genre.genreId]);
                    video.syncCastMembersId([
                        castMemberActor.castMemberId,
                        castMemberDirector.castMemberId,
                    ]);

                    await videoRepository.insert(video);

                    const response = await request(
                        appHelper.app.getHttpServer(),
                    )
                        .get(`/videos/${video.videoId.value}`)
                        .expect(200);

                    expect(response.body).toStrictEqual({
                        id: video.videoId.value,
                        title: 'Video',
                        description: 'Video description',
                        duration: 133,
                        rating: '16',
                        isOpened: true,
                        isPublished: false,
                        banner: null,
                        thumbnail: null,
                        thumbnailHalf: null,
                        yearLaunched: 2024,
                        categories: expect.arrayContaining([
                            {
                                id: category.categoryId.value,
                                name: category.name,
                                isActive: category.isActive,
                            },
                            {
                                id: category2.categoryId.value,
                                name: category2.name,
                                isActive: category2.isActive,
                            },
                        ]),
                        castMembers: expect.arrayContaining([
                            {
                                id: castMemberActor.castMemberId.value,
                                name: castMemberActor.name,
                                type: castMemberActor.type.value,
                            },
                            {
                                id: castMemberDirector.castMemberId.value,
                                name: castMemberDirector.name,
                                type: castMemberDirector.type.value,
                            },
                        ]),
                        genres: expect.arrayContaining([
                            {
                                id: genre.genreId.value,
                                name: genre.name,
                            },
                        ]),
                        createdAt: video.createdAt.toISOString(),
                    });
                });
            });
        });
    });
});
