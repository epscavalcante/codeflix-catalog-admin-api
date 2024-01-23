import { instanceToPlain } from 'class-transformer';
import { ListCategoriesFixture } from '../../src/categories/categories.fixture';
import { CategoryPresenter } from '../../src/categories/categories.presenter';
import { CATEGORY_PROVIDERS } from '../../src/categories/categories.provider';
import { startApp } from '../helpers/start-app';
import request from 'supertest';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import CategoryOutput from '@core/category/application/use-cases/mappers/category-output';

describe('CategoriesController (e2e)', () => {
    describe('GET /categories', () => {
        describe('should return categories sorted by created_at when request query is empty', () => {
            let categoryRepo: ICategoryRepository;
            const appHelper = startApp();
            const { entitiesMap, arrange } =
                ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

            beforeEach(async () => {
                categoryRepo = appHelper.app.get<ICategoryRepository>(
                    CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
                );
                await categoryRepo.bulkInsert(Object.values(entitiesMap));
            });

            test.each(arrange)(
                'when query params is $send_data',
                async ({ send_data, expected }) => {
                    const queryParams = new URLSearchParams(
                        send_data as any,
                    ).toString();
                    return request(appHelper.app.getHttpServer())
                        .get(`/categories/?${queryParams}`)
                        .authenticate(appHelper.app)
                        .expect(200)
                        .expect({
                            data: expected.entities.map((e) =>
                                instanceToPlain(
                                    new CategoryPresenter(
                                        CategoryOutput.toOutput(e),
                                    ),
                                ),
                            ),
                            meta: expected.meta,
                        });
                },
            );
        });

        describe('should return categories using paginate, filter and sort', () => {
            let categoryRepo: ICategoryRepository;
            const appHelper = startApp();
            const { entitiesMap, arrange } =
                ListCategoriesFixture.arrangeUnsorted();

            beforeEach(async () => {
                categoryRepo = appHelper.app.get<ICategoryRepository>(
                    CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
                );
                await categoryRepo.bulkInsert(Object.values(entitiesMap));
            });

            test.each([arrange[0]])(
                'when query params is $send_data',
                async ({ send_data, expected }) => {
                    const queryParams = new URLSearchParams(
                        send_data as any,
                    ).toString();
                    return request(appHelper.app.getHttpServer())
                        .get(`/categories?${queryParams}`)
                        .authenticate(appHelper.app)
                        .expect({
                            data: expected.entities.map((e) =>
                                instanceToPlain(
                                    new CategoryPresenter(
                                        CategoryOutput.toOutput(e),
                                    ),
                                ),
                            ),
                            meta: expected.meta,
                        });
                },
            );
        });
    });
});
