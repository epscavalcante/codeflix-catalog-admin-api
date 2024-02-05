import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import Genre from '@core/genre/domain/genre.aggregate';
import Category from '@core/category/domain/category.aggregate';
import { startApp } from '../../test/helpers/start-app';
import { GENRE_PROVIDERS } from '../../src/genres/genres.provider';
import { CATEGORY_PROVIDERS } from '../../src/categories/categories.provider';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import { GetGenreFixture } from '../../src/genres/genres.fixtures';
import GenreOutputMapper from '@core/genre/application/mappers/genre.use-case.output';
import { GenrePresenter } from '../../src/genres/genre.presenter';

describe('GenresController (e2e)', () => {
    const nestApp = startApp();
    describe('/genres/:id (GET)', () => {
        describe('should a response error when id is invalid or not found', () => {
            const arrange = [
                {
                    id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
                    expected: {
                        message:
                            'Genre not found using ID: 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
                        statusCode: 404,
                        error: 'Not Found',
                    },
                },
                {
                    id: 'fake id',
                    expected: {
                        statusCode: 422,
                        message: 'Validation failed (uuid is expected)',
                        error: 'Unprocessable Entity',
                    },
                },
            ];

            test.each(arrange)('when id is $id', async ({ id, expected }) => {
                return request(nestApp.app.getHttpServer())
                    .get(`/genres/${id}`)
                    .expect(expected.statusCode)
                    .expect(expected);
            });
        });

        it('should return a genre ', async () => {
            const genreRepo = nestApp.app.get<IGenreRepository>(
                GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
            );
            const categoryRepo = nestApp.app.get<ICategoryRepository>(
                CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
            );
            const categories = Category.fake().theCategories(3).build();
            await categoryRepo.bulkInsert(categories);
            const genre = Genre.fake()
                .aGenre()
                .addCategoryId(categories[0].categoryId)
                .addCategoryId(categories[1].categoryId)
                .addCategoryId(categories[2].categoryId)
                .build();
            await genreRepo.insert(genre);

            const res = await request(nestApp.app.getHttpServer())
                .get(`/genres/${genre.genreId.value}`)
                .expect(200);
            const keyInResponse = GetGenreFixture.keysInResponse;
            expect(Object.keys(res.body)).toStrictEqual(keyInResponse);

            const presenter = new GenrePresenter(
                GenreOutputMapper.toOutput(genre, categories),
            );
            const serialized = instanceToPlain(presenter);
            serialized.categoriesId = expect.arrayContaining(
                serialized.categoriesId,
            );
            serialized.categories = expect.arrayContaining(
                serialized.categories.map((category) => ({
                    id: category.id,
                    name: category.name,
                    isActive: category.isActive,
                    // created_at: category.created_at,
                })),
            );
            expect(res.body).toEqual(serialized);
        });
    });
});
