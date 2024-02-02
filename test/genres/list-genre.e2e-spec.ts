import request from 'supertest';
import qs from 'qs';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import { startApp } from '../../test/helpers/start-app';
import { ListGenresFixture } from '../../src/genres/genres.fixtures';
import { GENRE_PROVIDERS } from '../../src/genres/genres.provider';
import { CATEGORY_PROVIDERS } from '../../src/categories/categories.provider';

describe('GenresController (e2e)', () => {
    describe('/genres (GET)', () => {
        describe.skip('should return genres sorted by created_at when request query is empty', () => {
            let genreRepository: IGenreRepository;
            let categoryRepository: ICategoryRepository;
            const nestApp = startApp();
            const { relations, entitiesMap, arrange } =
                ListGenresFixture.arrangeIncrementedWithCreatedAt();

            beforeEach(async () => {
                genreRepository = nestApp.app.get<IGenreRepository>(
                    GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
                );
                categoryRepository = nestApp.app.get<ICategoryRepository>(
                    CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
                );
                await categoryRepository.bulkInsert(
                    Array.from(relations.categories.values()),
                );
                await genreRepository.bulkInsert(Object.values(entitiesMap));
            });

            test.each(arrange)(
                'when send_data is $send_data',
                async ({ send_data, expected }) => {
                    const queryParams = new URLSearchParams(
                        send_data as any,
                    ).toString();
                    const data = expected.entities.map((e) => ({
                        id: e.genreId.value,
                        name: e.name,
                        // is_active: e.is_active,
                        categoriesId: expect.arrayContaining(
                            Array.from(e.categoriesId.keys()),
                        ),
                        categories: expect.arrayContaining(
                            Array.from(relations.categories.values())
                                .filter((c) =>
                                    e.categoriesId.has(c.categoryId.value),
                                )
                                .map((c) => ({
                                    id: c.categoryId.value,
                                    name: c.name,
                                    isActive: c.isActive,
                                    //   created_at: c.createdAt.toISOString(),
                                })),
                        ),
                        createdAt: e.createdAt.toISOString(),
                    }));
                    const response = await request(nestApp.app.getHttpServer())
                        .get(`/genres/?${queryParams}`)
                        .expect(200);
                    expect(response.body).toStrictEqual({
                        data: data,
                        meta: expected.meta,
                    });
                },
            );
        });

        describe.only('should return genres using paginate, filter and sort', () => {
            let genreRepo: IGenreRepository;
            let categoryRepo: ICategoryRepository;

            const nestApp = startApp();
            const { relations, entitiesMap, arrange } =
                ListGenresFixture.arrangeUnsorted();

            beforeEach(async () => {
                genreRepo = nestApp.app.get<IGenreRepository>(
                    GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
                );
                categoryRepo = nestApp.app.get<ICategoryRepository>(
                    CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
                );
                await categoryRepo.bulkInsert(
                    Array.from(relations.categories.values()),
                );
                await genreRepo.bulkInsert(Object.values(entitiesMap));
            });

            test.each(arrange)(
                'when send_data is $send_data',
                async ({ send_data, expected }) => {
                    const queryParams = qs.stringify(send_data as any);
                    const data = expected.entities.map((e) => ({
                        id: e.genreId.value,
                        name: e.name,
                        // is_active: e.is_active,
                        categoriesId: expect.arrayContaining(
                            Array.from(e.categoriesId.keys()),
                        ),
                        categories: expect.arrayContaining(
                            Array.from(relations.categories.values())
                                .filter((c) =>
                                    e.categoriesId.has(c.categoryId.value),
                                )
                                .map((c) => ({
                                    id: c.categoryId.value,
                                    name: c.name,
                                    isActive: c.isActive,
                                    //   created_at: c.created_at.toISOString(),
                                })),
                        ),
                        createdAt: e.createdAt.toISOString(),
                    }));
                    const response = await request(
                        nestApp.app.getHttpServer(),
                    ).get(`/genres?${queryParams}`);
                    expect(response.statusCode).toBe(200);
                    expect(response.body).toStrictEqual({
                        data: data,
                        meta: expected.meta,
                    });
                },
            );
        });
    });
});
