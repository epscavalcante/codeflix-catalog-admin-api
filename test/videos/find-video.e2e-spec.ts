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
    beforeEach(() => {
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

    describe('GET /videos/{id}', () => {
        describe('should a response error when id is invalid or not found', () => {
            const arrange = [
                {
                    id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
                    expected: {
                        statusCode: 404,
                        error: 'Not Found',
                        message:
                            'Video not found using ID: 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
                    },
                },
                {
                    id: 'fake id',
                    expected: {
                        statusCode: 422,
                        error: 'Unprocessable Entity',
                        message: 'Validation failed (uuid is expected)',
                    },
                },
            ];

            test.each(arrange)('when id is $id', async ({ id, expected }) => {
                return request(appHelper.app.getHttpServer())
                    .get(`/videos/${id}`)
                    .expect(expected.statusCode)
                    .expect(expected);
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

                const response = await request(appHelper.app.getHttpServer())
                    .get(`/videos/${video.videoId.value}`)
                    .expect(200);

                expect(response.body).toStrictEqual({
                    id: video.videoId.value,
                    title: 'Video',
                    description: 'Video description',
                    duration: 133,
                    rating: '16',
                    banner: null,
                    thumbnail: null,
                    thumbnailHalf: null,
                    isOpened: true,
                    isPublished: false,
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
