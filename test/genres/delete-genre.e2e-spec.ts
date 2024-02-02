import Category from '@core/category/domain/category.aggregate';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import Genre from '@core/genre/domain/genre.aggregate';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import { CATEGORY_PROVIDERS } from '../../src/categories/categories.provider';
import { GENRE_PROVIDERS } from '../../src/genres/genres.provider';
import request from 'supertest';
import { startApp } from '../../test/helpers/start-app';

describe('GenresController (e2e)', () => {
    describe('/delete/:id (DELETE)', () => {
        const nestApp = startApp();
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
                    .delete(`/genres/${id}`)
                    .expect(expected.statusCode)
                    .expect(expected);
            });
        });

        it('should delete a category response with status 204', async () => {
            const genreRepo = nestApp.app.get<IGenreRepository>(
                GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
            );
            const categoryRepo = nestApp.app.get<ICategoryRepository>(
                CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
            );
            const category = Category.fake().aCategory().build();
            await categoryRepo.insert(category);
            const genre = Genre.fake()
                .aGenre()
                .addCategoryId(category.categoryId)
                .build();
            await genreRepo.insert(genre);

            await request(nestApp.app.getHttpServer())
                .delete(`/genres/${genre.genreId.value}`)
                .expect(204);

            await expect(genreRepo.findById(genre.genreId)).resolves.toBeNull();
        });
    });
});
