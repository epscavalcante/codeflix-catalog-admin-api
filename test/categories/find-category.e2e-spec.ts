import CategoryOutput from '@core/application/use-cases/mappers/category-output';
import Category from '@core/domain/entities/category.aggregate';
import ICategoryRepository from '@core/domain/repositories/category.repository.interface';
import { instanceToPlain } from 'class-transformer';
import { CategoryPresenter } from '../../src/categories/categories.presenter';
import { CATEGORY_PROVIDERS } from '../../src/categories/categories.provider';
import { startApp } from '../helpers/start-app';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
    const nestApp = startApp();
    describe('GET /categories/:id', () => {
        describe('should a response error when id is invalid or not found', () => {
            const arrange = [
                {
                    id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
                    expected: {
                        statusCode: 404,
                        error: 'Not Found',
                        message:
                            'Category not found using ID: 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
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
                return request(nestApp.app.getHttpServer())
                    .get(`/categories/${id}`)
                    .expect(expected.statusCode)
                    .expect(expected);
            });
        });

        it('should return a category ', async () => {
            const repository = nestApp.app.get<ICategoryRepository>(
                CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
            );
            const category = Category.fake().aCategory().build();
            await repository.insert(category);

            const res = await request(nestApp.app.getHttpServer())
                .get(`/categories/${category.categoryId.value}`)
                .expect(200);

            const presenter = new CategoryPresenter(
                CategoryOutput.toOutput(category),
            );
            const serialized = instanceToPlain(presenter);
            expect(res.body).toStrictEqual(serialized);
        });
    });
});
