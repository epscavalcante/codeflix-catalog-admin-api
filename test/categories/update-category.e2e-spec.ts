import { instanceToPlain } from 'class-transformer';
import { UpdateCategoryFixture } from '../../src/categories/categories.fixture';
import { CategoryPresenter } from '../../src/categories/categories.presenter';
import { CATEGORY_PROVIDERS } from '../../src/categories/categories.provider';
import { startApp } from '../helpers/start-app';
import request from 'supertest';
import Category, { CategoryId } from '@core/category/domain/category.aggregate';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import CategoryOutput from '@core/category/application/use-cases/mappers/category-output';

describe('CategoriesController (e2e)', () => {
    const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

    describe('PATCH /categories/:id', () => {
        describe('should a response error when id is invalid or not found', () => {
            const nestApp = startApp();
            const faker = Category.fake().aCategory();
            const arrange = [
                {
                    id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
                    send_data: { name: faker.name },
                    expected: {
                        statusCode: 404,
                        message:
                            'Category not found using ID: 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
                        error: 'Not Found',
                    },
                },
                {
                    id: 'fake id',
                    send_data: { name: faker.name },
                    expected: {
                        statusCode: 422,
                        error: 'Unprocessable Entity',
                        message: 'Validation failed (uuid is expected)',
                    },
                },
            ];

            test.each(arrange)(
                'when id is $id',
                async ({ id, send_data, expected }) => {
                    return request(nestApp.app.getHttpServer())
                        .patch(`/categories/${id}`)
                        .send(send_data)
                        .expect(expected.statusCode)
                        .expect(expected);
                },
            );
        });

        describe('should a response error with 422 when request body is invalid', () => {
            const app = startApp();
            const invalidRequest =
                UpdateCategoryFixture.arrangeInvalidRequest();
            const arrange = Object.keys(invalidRequest).map((key) => ({
                label: key,
                value: invalidRequest[key],
            }));
            test.each(arrange)('when body is $label', ({ value }) => {
                return request(app.app.getHttpServer())
                    .patch(`/categories/${uuid}`)
                    .send(value.send_data)
                    .expect(422)
                    .expect(value.expected);
            });
        });

        describe('should a response error with 422 when throw EntityValidationError', () => {
            const app = startApp();
            const validationError =
                UpdateCategoryFixture.arrangeForEntityValidationError();
            const arrange = Object.keys(validationError).map((key) => ({
                label: key,
                value: validationError[key],
            }));
            let repository: ICategoryRepository;

            beforeEach(() => {
                repository = app.app.get<ICategoryRepository>(
                    CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
                );
            });
            test.each(arrange)('when body is $label', async ({ value }) => {
                const category = Category.fake().aCategory().build();
                await repository.insert(category);
                return request(app.app.getHttpServer())
                    .patch(`/categories/${category.categoryId.value}`)
                    .send(value.send_data)
                    .expect(422)
                    .expect(value.expected);
            });
        });

        describe('should update a category', () => {
            const appHelper = startApp();
            const arrange = UpdateCategoryFixture.arrangeForUpdate();
            let repository: ICategoryRepository;

            beforeEach(async () => {
                repository = appHelper.app.get<ICategoryRepository>(
                    CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
                );
            });
            test.each(arrange)(
                'when body is $send_data',
                async ({ send_data, expected }) => {
                    const categoryCreated = Category.fake().aCategory().build();
                    await repository.insert(categoryCreated);

                    const res = await request(appHelper.app.getHttpServer())
                        .patch(
                            `/categories/${categoryCreated.categoryId.value}`,
                        )
                        .send(send_data)
                        .expect(200);
                    const id = res.body.id;
                    const categoryUpdated = await repository.findById(
                        new CategoryId(id),
                    );
                    const presenter = new CategoryPresenter(
                        CategoryOutput.toOutput(categoryUpdated!),
                    );
                    const serialized = instanceToPlain(presenter);
                    expect(res.body).toStrictEqual(serialized);
                    expect(res.body).toStrictEqual({
                        id: serialized.id,
                        createdAt: serialized.createdAt,
                        name: expected.name ?? categoryUpdated!.name,
                        description:
                            'description' in expected
                                ? expected.description
                                : categoryUpdated!.description,
                        isActive:
                            expected.isActive ?? categoryUpdated!.isActive,
                    });
                },
            );
        });
    });
});
