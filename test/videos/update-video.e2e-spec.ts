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
import Video, { VideoId } from '@core/video/domain/video.aggregate';
import { VideoCategoryModel } from '@core/video/infra/database/sequelize/models/video.model';

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

    describe('PATCH /videos/{id}', () => {
        const appHelper = startApp();
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
                    .delete(`/videos/${id}`)
                    .authenticate(appHelper.app)
                    .expect(expected.statusCode)
                    .expect(expected);
            });
        });

        describe('Should receives 422 statusCode when send invalid data', () => {
            test('When body is invalid title', async () => {
                const category = Category.fake().aCategory().build();
                const category2 = Category.fake().aCategory().build();

                const genre = Genre.fake()
                    .aGenre()
                    .addCategoryId(category.categoryId)
                    .build();

                const actor = CastMember.fake().anActor().build();
                const director = CastMember.fake().aDirector().build();

                const video = Video.fake().aVideoWithoutMedias().build();
                video.syncCastMembersId([
                    actor.castMemberId,
                    director.castMemberId,
                ]);
                video.syncCategoriesId([category2.categoryId]);
                video.syncGenresId([genre.genreId]);

                await categoryRepository.bulkInsert([category, category2]);
                await castMemberRepository.bulkInsert([actor, director]);
                await genreRepository.insert(genre);
                await videoRepository.insert(video);

                const response = await request(appHelper.app.getHttpServer())
                    .patch(`/videos/${video.videoId.value}`)
                    .send({
                        title: 'a'.repeat(256),
                    })
                    .expect(422);

                expect(response.body).toStrictEqual({
                    statusCode: 422,
                    error: 'Unprocessable Entity',
                    message: [
                        'title must be shorter than or equal to 255 characters',
                    ],
                });
            });
        });

        describe('Should update a video', () => {
            test('ok', async () => {
                const category = Category.fake().aCategory().build();
                const category2 = Category.fake().aCategory().build();
                const category3 = Category.fake().aCategory().build();
                const category4 = Category.fake().aCategory().build();
                await categoryRepository.bulkInsert([
                    category,
                    category2,
                    category3,
                    category4,
                ]);
                const genre = Genre.fake()
                    .aGenre()
                    .addCategoryId(category.categoryId)
                    .build();
                await genreRepository.insert(genre);
                const director = CastMember.fake().aDirector().build();
                const actor = CastMember.fake().anActor().build();
                await castMemberRepository.bulkInsert([actor, director]);
                const video = Video.fake()
                    .aVideoWithoutMedias()
                    .withMarkAsNotOpened()
                    .build();
                video.syncCastMembersId([
                    actor.castMemberId,
                    director.castMemberId,
                ]);
                video.syncCategoriesId([category2.categoryId]);
                video.syncGenresId([genre.genreId]);
                await videoRepository.insert(video);

                const response = await request(appHelper.app.getHttpServer())
                    .patch(`/videos/${video.videoId}`)
                    .send({
                        title: 'Title',
                        description: 'Description',
                        yearLaunched: 2034,
                        duration: 125,
                        isOpened: true,
                        rating: '18',
                        categoriesId: [
                            category3.categoryId.value,
                            category4.categoryId.value,
                        ],
                    })
                    .expect(200);
                expect(response.body.id).toBe(video.videoId.value);
                const videoUpdated = await videoRepository.findById(
                    new VideoId(response.body.id),
                );
                expect(videoUpdated).toBeDefined();
                expect(
                    Array.from(videoUpdated!.genresId.values()),
                ).toHaveLength(1);
                expect(
                    Array.from(videoUpdated!.categoriesId.values()),
                ).toHaveLength(2);
                expect(
                    Array.from(videoUpdated!.castMembersId.values()),
                ).toHaveLength(2);
                await expect(VideoCategoryModel.count()).resolves.toBe(2);

                expect(videoUpdated!.toJSON()).toStrictEqual({
                    videoId: video.videoId.value,
                    title: 'Title',
                    description: 'Description',
                    duration: 125,
                    rating: '18',
                    isOpened: true,
                    isPublished: false,
                    yearLaunched: 2034,
                    thumbnail: null,
                    thumbnailHalf: null,
                    banner: null,
                    video: null,
                    trailer: null,
                    categoriesId: expect.arrayContaining([
                        category3.categoryId.value,
                        category4.categoryId.value,
                    ]),
                    castMembersId: expect.arrayContaining([
                        actor.castMemberId.value,
                        director.castMemberId.value,
                    ]),
                    genresId: expect.arrayContaining([genre.genreId.value]),
                    createdAt: video.createdAt,
                });
            });
        });
    });
});
