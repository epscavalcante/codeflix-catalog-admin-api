import request from 'supertest';
import { CATEGORY_PROVIDERS } from '../../src/categories/categories.provider';
import { startApp } from '../helpers/start-app';
import { instanceToPlain } from 'class-transformer';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import { GENRE_PROVIDERS } from '../../src/genres/genres.provider';
import { CreateGenreFixture } from '../../src/genres/genres.fixtures';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import GenreId from '@core/genre/domain/genre.id.vo';
import GenreOutputMapper from '@core/genre/application/mappers/genre.use-case.output';
import { GenrePresenter } from '../../src/genres/genre.presenter';

describe('GenresController (e2e)', () => {
    describe('POST /genres', () => {
        describe('Should receives 422 statusCode when send invalid data', () => {
            const app = startApp();
            const invalidRequest = CreateGenreFixture.arrangeInvalidRequest();
            const arrange = Object.keys(invalidRequest).map((key) => ({
                label: key,
                value: invalidRequest[key],
            }));

            test.each(arrange)('When body is $label', async ({ value }) => {
                return request(app.app.getHttpServer())
                    .post('/genres')
                    .send(value.send_data)
                    .expect(422)
                    .expect(value.expected);
            });
        });

        describe('Should receives 422 statusCode when send throw EntityValidationError', () => {
            const app = startApp();
            const invalidRequest =
                CreateGenreFixture.arrangeForEntityValidationError();
            const arrange = Object.keys(invalidRequest).map((key) => ({
                label: key,
                value: invalidRequest[key],
            }));

            test.each(arrange)('When body is $label', async ({ value }) => {
                return request(app.app.getHttpServer())
                    .post('/genres')
                    .send(value.send_data)
                    .expect(422)
                    .expect(value.expected);
            });
        });

        describe('Should create genre', () => {
            const app = startApp();
            let genreRepository: IGenreRepository;
            let categoryRepository: ICategoryRepository;
            beforeEach(async () => {
                genreRepository = app.app.get<IGenreRepository>(
                    GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
                );
                categoryRepository = app.app.get<ICategoryRepository>(
                    CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
                );
            });

            const arrange = CreateGenreFixture.arrangeForSave();
            test.each(arrange)(
                'When body is $send_data',
                async ({ send_data, expected, relations }) => {
                    await categoryRepository.bulkInsert(relations.categories);
                    const response = await request(app.app.getHttpServer())
                        .post('/genres')
                        .send(send_data)
                        .expect(201);

                    const keyInResponse = CreateGenreFixture.keysInResponse;
                    expect(Object.keys(response.body)).toStrictEqual(
                        keyInResponse,
                    );

                    const genreResponse = response.body;
                    const genreCreated = await genreRepository.findById(
                        new GenreId(genreResponse.id),
                    );
                    const presenter = new GenrePresenter(
                        GenreOutputMapper.toOutput(
                            genreCreated!,
                            relations.categories,
                        ),
                    );
                    const genreSerialized = instanceToPlain(presenter);

                    expect(genreResponse).toStrictEqual({
                        id: genreSerialized.id,
                        createdAt: genreSerialized.createdAt,
                        ...expected,
                    });
                },
            );
        });
    });
});
