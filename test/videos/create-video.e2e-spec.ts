import request from 'supertest';
import { startApp } from '../helpers/start-app';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import { VIDEO_PROVIDERS } from '../../src/videos/videos.providers';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import { GENRE_PROVIDERS } from '../../src/genres/genres.provider';
import { CAST_MEMBER_PROVIDERS } from '../../src/cast-members/cast-members.provider';
import { CATEGORY_PROVIDERS } from '../../src/categories/categories.provider';
import Category, { CategoryId } from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import { VideoId } from '@core/video/domain/video.aggregate';
import GenreId from '@core/genre/domain/genre.id.vo';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';

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

    describe('POST /videos', () => {
        describe('Should receives 422 statusCode when send invalid data', () => {
            test('When body is $label', async () => {
                return request(appHelper.app.getHttpServer())
                    .post('/videos')
                    .send({})
                    .expect(422);
            });
        });

        describe('Should create a video', () => {
            test('ok', async () => {
                const category = Category.fake().aCategory().build();
                const category2 = Category.fake().aCategory().build();
                await categoryRepository.bulkInsert([category, category2]);
                const genre = Genre.fake()
                    .aGenre()
                    .addCategoryId(category.categoryId)
                    .build();
                await genreRepository.insert(genre);
                const castMemberDirector = CastMember.fake()
                    .aDirector()
                    .build();
                const castMemberActor = CastMember.fake().anActor().build();
                await castMemberRepository.bulkInsert([
                    castMemberActor,
                    castMemberDirector,
                ]);

                const response = await request(appHelper.app.getHttpServer())
                    .post('/videos')
                    .send({
                        title: 'Title',
                        description: 'Description',
                        yearLaunched: 2034,
                        duration: 125,
                        isOpened: false,
                        rating: '18',
                        categoriesId: [
                            category.categoryId.value,
                            category2.categoryId.value,
                        ],
                        genresId: [genre.genreId.value],
                        castMembersId: [
                            castMemberActor.castMemberId.value,
                            castMemberDirector.castMemberId.value,
                        ],
                    })
                    .expect(201);
                expect(response.body.id).toBeDefined();
                const videoCreated = await videoRepository.findById(
                    new VideoId(response.body.id),
                );
                expect(videoCreated).toBeDefined();
                const video = videoCreated!.toJSON();
                const genresExists = await genreRepository.existsByIds(
                    video!.genresId.map((i) => new GenreId(i)),
                );
                expect(genresExists.exists).toHaveLength(1);
                expect(genresExists.notExists).toHaveLength(0);

                const categoriesExists = await categoryRepository.existsByIds(
                    video!.categoriesId.map((i) => new CategoryId(i)),
                );
                expect(categoriesExists.exists).toHaveLength(2);
                expect(categoriesExists.notExists).toHaveLength(0);

                const castMemberExists = await castMemberRepository.existsByIds(
                    video!.castMembersId.map((i) => new CastMemberId(i)),
                );
                expect(castMemberExists.exists).toHaveLength(2);
                expect(castMemberExists.notExists).toHaveLength(0);

                expect(
                    Array.from(videoCreated!.genresId.values()),
                ).toHaveLength(1);
                expect(
                    Array.from(videoCreated!.categoriesId.values()),
                ).toHaveLength(2);
                expect(
                    Array.from(videoCreated!.castMembersId.values()),
                ).toHaveLength(2);
            });
        });
    });
});
