import request from 'supertest';
import { startApp } from '../helpers/start-app';
import IVideoRepository from '@core/genre/domain/genre.repository.interface';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import { VIDEO_PROVIDERS } from 'src/videos/videos.providers';

describe('VideosController (e2e)', () => {
    describe('POST /videos', () => {
        describe('Should receives 422 statusCode when send invalid data', () => {
            const app = startApp();

            test('When body is $label', async () => {
                return request(app.app.getHttpServer())
                    .post('/videos')
                    .send({})
                    .expect(422);
            });
        });

        describe('Should create a video', () => {
            const app = startApp();
            let videoRepository: IVideoRepository;
            // let categoryRepository: ICategoryRepository;
            beforeEach(() => {
                videoRepository = app.app.get<IVideoRepository>(
                    VIDEO_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
                );
                // categoryRepository = app.app.get<ICategoryRepository>(
                //     CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
                // );
            });

            test.only('When body is $send_data', async () => {
                // await categoryRepository.bulkInsert(relations.categories);
                const response = await request(app.app.getHttpServer())
                    .post('/videos')
                    .send({
                        title: 'teste',
                    })
                    .expect(201);
                console.log(response);

                // const keyInResponse = CreateGenreFixture.keysInResponse;
                // expect(Object.keys(response.body)).toStrictEqual(keyInResponse);

                // const genreResponse = response.body;
                // const genreCreated = await genreRepository.findById(
                //     new GenreId(genreResponse.id),
                // );
                // const presenter = new GenrePresenter(
                //     GenreOutputMapper.toOutput(
                //         genreCreated!,
                //         relations.categories,
                //     ),
                // );
                // const genreSerialized = instanceToPlain(presenter);

                // expect(genreResponse).toStrictEqual({
                //     id: genreSerialized.id,
                //     createdAt: genreSerialized.createdAt,
                //     ...expected,
                // });
            });
        });
    });
});
