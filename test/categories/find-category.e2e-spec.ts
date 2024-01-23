import { instanceToPlain } from 'class-transformer';
import { CategoryPresenter } from '../../src/categories/categories.presenter';
import { CATEGORY_PROVIDERS } from '../../src/categories/categories.provider';
import { startApp } from '../helpers/start-app';
import request from 'supertest';
import Category from '@core/category/domain/category.aggregate';
import CategoryOutput from '@core/category/application/use-cases/mappers/category-output';
import ICategoryRepository from '@core/category/domain/category.repository.interface';

describe('CategoriesController (e2e)', () => {
    const appHelper = startApp();
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
                return request(appHelper.app.getHttpServer())
                    .get(`/categories/${id}`)
                    .authenticate(appHelper.app)
                    .expect(expected.statusCode)
                    .expect(expected);
            });
        });

        it('should return a category ', async () => {
            const repository = appHelper.app.get<ICategoryRepository>(
                CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
            );
            const category = Category.fake().aCategory().build();
            await repository.insert(category);

            const res = await request(appHelper.app.getHttpServer())
                .get(`/categories/${category.categoryId.value}`)
                .authenticate(appHelper.app)
                .expect(200);

            const presenter = new CategoryPresenter(
                CategoryOutput.toOutput(category),
            );
            const serialized = instanceToPlain(presenter);
            expect(res.body).toStrictEqual(serialized);
        });
    });
});
