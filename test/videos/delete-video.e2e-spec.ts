import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import { startApp } from '../helpers/start-app';
import request from 'supertest';
import { CAST_MEMBER_PROVIDERS } from '../../src/cast-members/cast-members.provider';
import { CATEGORY_PROVIDERS } from '../../src/categories/categories.provider';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import { VIDEO_PROVIDERS } from '../../src/videos/videos.providers';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import Video from '@core/video/domain/video.aggregate';
import { GENRE_PROVIDERS } from '../../src/genres/genres.provider';
import {
    VideoCastMemberModel,
    VideoCategoryModel,
    VideoGenreModel,
} from '@core/video/infra/database/sequelize/models/video.model';
import VideoImageMediaModel from '@core/video/infra/database/sequelize/models/video-image-media.model';
import AudioVideoMediaModel from '@core/video/infra/database/sequelize/models/video-audio-media.model';

describe('VideosController (e2e)', () => {
    describe('DELETE /videos/:id', () => {
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

        it('should delete a video response with status 204', async () => {
            const categoryRepo = appHelper.app.get<ICategoryRepository>(
                CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
            );
            const videoRepository = appHelper.app.get<IVideoRepository>(
                VIDEO_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
            );
            const genreRepository = appHelper.app.get<IGenreRepository>(
                GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
            );
            const castMemberRepository =
                appHelper.app.get<ICastMemberRepository>(
                    CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY
                        .provide,
                );

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

            await Promise.all([
                categoryRepo.bulkInsert([category, category2]),
                castMemberRepository.bulkInsert([actor, director]),
                genreRepository.insert(genre),
                videoRepository.insert(video),
            ]);

            await request(appHelper.app.getHttpServer())
                .delete(`/videos/${video.videoId.value}`)
                .authenticate(appHelper.app)
                .expect(204);

            await expect(
                videoRepository.findById(video.videoId),
            ).resolves.toBeNull();

            await expect(VideoCategoryModel.count()).resolves.toBe(0);
            await expect(VideoGenreModel.count()).resolves.toBe(0);
            await expect(VideoCastMemberModel.count()).resolves.toBe(0);
            await expect(VideoImageMediaModel.count()).resolves.toBe(0);
            await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
        });
    });
});
