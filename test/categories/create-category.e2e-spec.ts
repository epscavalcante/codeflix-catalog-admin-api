import request from 'supertest';
import { CreateCategoryFixture } from '../../src/categories/categories.fixture';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import { CATEGORY_PROVIDERS } from '../../src/categories/categories.provider';
import { startApp } from '../helpers/start-app';
import CategoryOutput from '@core/category/application/use-cases/mappers/category-output';
import { instanceToPlain } from 'class-transformer';
import { CategoryPresenter } from '../../src/categories/categories.presenter';
import { CategoryId } from '@core/category/domain/category.aggregate';

describe('CategoriesController (e2e)', () => {
    const appHelper = startApp();

    let repository: ICategoryRepository;

    beforeEach(async () => {
        repository = appHelper.app.get<ICategoryRepository>(
            CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
    });

    describe('POST /categories', () => {
        describe('Should create category', () => {
            const arrange = CreateCategoryFixture.arrangeForCreate();

            test.each(arrange)(
                'When body is $send_data',
                async ({ send_data, expected }) => {
                    const response = await request(
                        appHelper.app.getHttpServer(),
                    )
                        .post('/categories')
                        .authenticate(appHelper.app)
                        .send(send_data);

                    expect(response.status).toBe(201);

                    const categoryResponse = response.body;
                    const categoryCreated = await repository.findById(
                        new CategoryId(categoryResponse.id),
                    );
                    const presenter = new CategoryPresenter(
                        CategoryOutput.toOutput(categoryCreated!),
                    );
                    const categorySerialized = instanceToPlain(presenter);

                    expect(categoryResponse).toStrictEqual({
                        id: categorySerialized.id,
                        createdAt: categorySerialized.createdAt,
                        ...expected,
                    });
                },
            );
        });

        describe('Should receives 422 statusCode when send invalid data', () => {
            const invalidRequest =
                CreateCategoryFixture.arrangeInvalidRequest();
            const arrange = Object.keys(invalidRequest).map((key) => ({
                label: key,
                value: invalidRequest[key],
            }));

            test.each(arrange)('When body is $label', async ({ value }) => {
                return request(appHelper.app.getHttpServer())
                    .post('/categories')
                    .authenticate(appHelper.app)
                    .send(value.send_data)
                    .expect(422)
                    .expect(value.expected);
            });
        });

        describe('Should receives 422 statusCode when send throw EntityValidationError', () => {
            const invalidRequest =
                CreateCategoryFixture.arrangeForEntityValidationError();
            const arrange = Object.keys(invalidRequest).map((key) => ({
                label: key,
                value: invalidRequest[key],
            }));

            test.each(arrange)('When body is $label', async ({ value }) => {
                return request(appHelper.app.getHttpServer())
                    .post('/categories')
                    .authenticate(appHelper.app)
                    .send(value.send_data)
                    .expect(422)
                    .expect(value.expected);
            });
        });
    });
});
