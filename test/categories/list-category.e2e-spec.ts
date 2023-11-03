import CategoryOutput from '@core/application/use-cases/mappers/category-output';
import ICategoryRepository from '@core/domain/repositories/category.repository';
import { instanceToPlain } from 'class-transformer';
import { ListCategoriesFixture } from '../../src/categories/categories.fixture';
import { CategoryPresenter } from '../../src/categories/categories.presenter';
import { CATEGORY_PROVIDERS } from '../../src/categories/categories.provider';
import { startApp } from '../helpers/start-app';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
    describe('GET /categories', () => {
        describe('should return categories sorted by created_at when request query is empty', () => {
            let categoryRepo: ICategoryRepository;
            const nestApp = startApp();
            const { entitiesMap, arrange } =
                ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

            beforeEach(async () => {
                categoryRepo = nestApp.app.get<ICategoryRepository>(
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
                    return request(nestApp.app.getHttpServer())
                        .get(`/categories/?${queryParams}`)
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
            const nestApp = startApp();
            const { entitiesMap, arrange } =
                ListCategoriesFixture.arrangeUnsorted();

            beforeEach(async () => {
                categoryRepo = nestApp.app.get<ICategoryRepository>(
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
                    return request(nestApp.app.getHttpServer())
                        .get(`/categories?${queryParams}`)
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
