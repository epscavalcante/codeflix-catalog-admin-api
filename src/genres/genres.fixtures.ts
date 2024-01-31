import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';

const _keysInResponse = [
    'id',
    'name',
    'categoriesId',
    'categories',
    //   'isActive',
    'createdAt',
];

export class GetGenreFixture {
    static keysInResponse = _keysInResponse;
}

export class CreateGenreFixture {
    static keysInResponse = _keysInResponse;

    static arrangeForSave() {
        const faker = Genre.fake().aGenre().withName('test name');
        const category = Category.fake().aCategory().build();

        const case1 = {
            relations: {
                categories: [category],
            },
            send_data: {
                name: faker.name,
                categoriesId: [category.categoryId.value],
            },
            expected: {
                name: faker.name,
                categories: expect.arrayContaining([
                    {
                        id: category.categoryId.value,
                        name: category.name,
                        isActive: category.isActive,
                        // createdAt: category.createdAt.toISOString(),
                    },
                ]),
                categoriesId: expect.arrayContaining([
                    category.categoryId.value,
                ]),
                // isActive: true,
            },
        };

        const categories = Category.fake().theCategories(3).build();
        const case2 = {
            relations: {
                categories,
            },
            send_data: {
                name: faker.name,
                categoriesId: [
                    categories[0].categoryId.value,
                    categories[1].categoryId.value,
                    categories[2].categoryId.value,
                ],
                // categories: expect.arrayContaining([
                //   {
                //     id: categories[0].categoryId.value,
                //     name: categories[0].name,
                //     isActive: category.isActive,
                //     // createdAt: categories[0].createdAt.toISOString(),
                //   },
                //   {
                //     id: categories[1].categoryId.value,
                //     name: categories[1].name,
                //     isActive: category.isActive,
                //     // createdAt: categories[1].createdAt.toISOString(),
                //   },
                //   {
                //     id: categories[2].categoryId.value,
                //     name: categories[2].name,
                //     isActive: category.isActive,
                //     // createdAt: categories[2].createdAt.toISOString(),
                //   },
                // ]),
                // isActive: false,
            },
            expected: {
                name: faker.name,
                categoriesId: expect.arrayContaining([
                    categories[0].categoryId.value,
                    categories[1].categoryId.value,
                    categories[2].categoryId.value,
                ]),
                categories: expect.arrayContaining([
                    {
                        id: categories[0].categoryId.value,
                        name: categories[0].name,
                        isActive: categories[0].isActive,
                        // createdAt: categories[0].createdAt.toISOString(),
                    },
                    {
                        id: categories[1].categoryId.value,
                        name: categories[1].name,
                        isActive: categories[0].isActive,
                        // createdAt: categories[1].createdAt.toISOString(),
                    },
                    {
                        id: categories[2].categoryId.value,
                        name: categories[2].name,
                        isActive: categories[0].isActive,
                        // createdAt: categories[2].createdAt.toISOString(),
                    },
                ]),
                // isActive: false,
            },
        };

        return [case1, case2];
    }

    static arrangeInvalidRequest() {
        const faker = Genre.fake().aGenre();
        const defaultExpected = {
            statusCode: 422,
            error: 'Unprocessable Entity',
        };

        return {
            EMPTY: {
                send_data: {},
                expected: {
                    message: [
                        'name should not be empty',
                        'name must be a string',
                        'categoriesId should not be empty',
                        'categoriesId must be an array',
                        'each value in categoriesId must be a UUID',
                    ],
                    ...defaultExpected,
                },
            },
            NAME_UNDEFINED: {
                send_data: {
                    name: undefined,
                    categoriesId: [faker.categoriesId[0].value],
                },
                expected: {
                    message: [
                        'name should not be empty',
                        'name must be a string',
                    ],
                    ...defaultExpected,
                },
            },
            NAME_NULL: {
                send_data: {
                    name: null,
                    categoriesId: [faker.categoriesId[0].value],
                },
                expected: {
                    message: [
                        'name should not be empty',
                        'name must be a string',
                    ],
                    ...defaultExpected,
                },
            },
            NAME_EMPTY: {
                send_data: {
                    name: '',
                    categoriesId: [faker.categoriesId[0].value],
                },
                expected: {
                    message: ['name should not be empty'],
                    ...defaultExpected,
                },
            },
            CATEGORIES_ID_UNDEFINED: {
                send_data: {
                    name: faker.name,
                    categoriesId: undefined,
                },
                expected: {
                    message: [
                        'categoriesId should not be empty',
                        'categoriesId must be an array',
                        'each value in categoriesId must be a UUID',
                    ],
                    ...defaultExpected,
                },
            },
            CATEGORIES_ID_NULL: {
                send_data: {
                    name: faker.name,
                    categoriesId: null,
                },
                expected: {
                    message: [
                        'categoriesId should not be empty',
                        'categoriesId must be an array',
                        'each value in categoriesId must be a UUID',
                    ],
                    ...defaultExpected,
                },
            },
            CATEGORIES_ID_EMPTY: {
                send_data: {
                    name: faker.name,
                    categoriesId: '',
                },
                expected: {
                    message: [
                        'categoriesId should not be empty',
                        'categoriesId must be an array',
                        'each value in categoriesId must be a UUID',
                    ],
                    ...defaultExpected,
                },
            },
            CATEGORIES_ID_NOT_VALID: {
                send_data: {
                    name: faker.name,
                    categoriesId: ['a'],
                },
                expected: {
                    message: ['each value in categoriesId must be a UUID'],
                    ...defaultExpected,
                },
            },
        };
    }

    static arrangeForEntityValidationError() {
        const faker = Genre.fake().aGenre();
        const defaultExpected = {
            statusCode: 422,
            error: 'Unprocessable Entity',
        };

        return {
            NAME_TOO_LONG: {
                send_data: {
                    name: faker.withInvalidNameTooLong().name,
                    categoriesId: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
                },
                expected: {
                    message: [
                        'name must be shorter than or equal to 255 characters',
                        'Category not found using ID: d8952775-5f69-42d5-9e94-00f097e1b98c',
                    ],
                    ...defaultExpected,
                },
            },
            CATEGORIES_ID_NOT_EXISTS: {
                send_data: {
                    name: faker.withName('action').name,
                    categoriesId: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
                },
                expected: {
                    message: [
                        'Category not found using ID: d8952775-5f69-42d5-9e94-00f097e1b98c',
                    ],
                    ...defaultExpected,
                },
            },
        };
    }
}

export class UpdateGenreFixture {
    static keysInResponse = _keysInResponse;

    static arrangeForSave() {
        const faker = Genre.fake().aGenre().withName('test name');

        const category = Category.fake().aCategory().build();

        const case1 = {
            entity: faker.addCategoryId(category.categoryId).build(),
            relations: {
                categories: [category],
            },
            send_data: {
                name: faker.name,
                categoriesId: [category.categoryId.value],
            },
            expected: {
                name: faker.name,
                categoriesId: expect.arrayContaining([
                    category.categoryId.value,
                ]),
                categories: expect.arrayContaining([
                    {
                        id: category.categoryId.value,
                        name: category.name,
                        createdAt: category.createdAt.toISOString(),
                    },
                ]),
                isActive: true,
            },
        };

        const case2 = {
            entity: faker.addCategoryId(category.categoryId).build(),
            relations: {
                categories: [category],
            },
            send_data: {
                name: faker.name,
                categoriesId: [category.categoryId.value],
                isActive: false,
            },
            expected: {
                name: faker.name,
                categoriesId: expect.arrayContaining([
                    category.categoryId.value,
                ]),
                categories: expect.arrayContaining([
                    {
                        id: category.categoryId.value,
                        name: category.name,
                        createdAt: category.createdAt.toISOString(),
                    },
                ]),
                isActive: false,
            },
        };

        const categories = Category.fake().theCategories(3).build();
        const case3 = {
            entity: faker.addCategoryId(category.categoryId).build(),
            relations: {
                categories: [category, ...categories],
            },
            send_data: {
                name: faker.name,
                categoriesId: [
                    categories[0].categoryId.value,
                    categories[1].categoryId.value,
                    categories[2].categoryId.value,
                ],
            },
            expected: {
                name: faker.name,
                categoriesId: expect.arrayContaining([
                    categories[0].categoryId.value,
                    categories[1].categoryId.value,
                    categories[2].categoryId.value,
                ]),
                categories: expect.arrayContaining([
                    {
                        id: categories[0].categoryId.value,
                        name: categories[0].name,
                        createdAt: categories[0].createdAt.toISOString(),
                    },
                    {
                        id: categories[1].categoryId.value,
                        name: categories[1].name,
                        createdAt: categories[1].createdAt.toISOString(),
                    },
                    {
                        id: categories[2].categoryId.value,
                        name: categories[2].name,
                        createdAt: categories[2].createdAt.toISOString(),
                    },
                ]),
                isActive: true,
            },
        };

        return [case1, case2, case3];
    }

    static arrangeInvalidRequest() {
        const faker = Genre.fake().aGenre();
        const defaultExpected = {
            statusCode: 422,
            error: 'Unprocessable Entity',
        };

        return {
            CATEGORIES_ID_NOT_VALID: {
                send_data: {
                    name: faker.name,
                    categoriesId: ['a'],
                },
                expected: {
                    message: ['each value in categoriesId must be a UUID'],
                    ...defaultExpected,
                },
            },
        };
    }

    static arrangeForEntityValidationError() {
        const faker = Genre.fake().aGenre();
        const defaultExpected = {
            statusCode: 422,
            error: 'Unprocessable Entity',
        };

        return {
            CATEGORIES_ID_NOT_EXISTS: {
                send_data: {
                    name: faker.withName('action').name,
                    categoriesId: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
                },
                expected: {
                    message: [
                        'Category not Found using ID d8952775-5f69-42d5-9e94-00f097e1b98c',
                    ],
                    ...defaultExpected,
                },
            },
        };
    }
}

export class ListGenresFixture {
    static arrangeIncrementedWithCreatedAt() {
        const category = Category.fake().aCategory().build();
        const _entities = Genre.fake()
            .theGenres(4)
            .addCategoryId(category.categoryId)
            .withName((i) => i + ' Category')
            .withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))
            .build();

        const entitiesMap = {
            first: _entities[0],
            second: _entities[1],
            third: _entities[2],
            fourth: _entities[3],
        };

        const relations = {
            categories: new Map([[category.categoryId.value, category]]),
        };

        const arrange = [
            {
                send_data: {},
                expected: {
                    entities: [
                        entitiesMap.fourth,
                        entitiesMap.third,
                        entitiesMap.second,
                        entitiesMap.first,
                    ],
                    meta: {
                        currentPage: 1,
                        lastPage: 1,
                        perPage: 15,
                        total: 4,
                    },
                },
            },
            {
                send_data: {
                    page: 1,
                    perPage: 2,
                },
                expected: {
                    entities: [entitiesMap.fourth, entitiesMap.third],
                    meta: {
                        currentPage: 1,
                        lastPage: 2,
                        perPage: 2,
                        total: 4,
                    },
                },
            },
            {
                send_data: {
                    page: 2,
                    perPage: 2,
                },
                expected: {
                    entities: [entitiesMap.second, entitiesMap.first],
                    meta: {
                        currentPage: 2,
                        lastPage: 2,
                        perPage: 2,
                        total: 4,
                    },
                },
            },
        ];

        return { arrange, entitiesMap, relations };
    }

    static arrangeUnsorted() {
        const categories = Category.fake().theCategories(4).build();

        const relations = {
            categories: new Map(
                categories.map((category) => [
                    category.categoryId.value,
                    category,
                ]),
            ),
        };

        const createdAt = new Date();

        const entitiesMap = {
            test: Genre.fake()
                .aGenre()
                .addCategoryId(categories[0].categoryId)
                .addCategoryId(categories[1].categoryId)
                .withName('test')
                .withCreatedAt(new Date(createdAt.getTime() + 1000))
                .build(),
            aaa: Genre.fake()
                .aGenre()
                .addCategoryId(categories[0].categoryId)
                .addCategoryId(categories[1].categoryId)
                .withName('aaa')
                .withCreatedAt(new Date(createdAt.getTime() + 2000))
                .build(),
            TEST: Genre.fake()
                .aGenre()
                .addCategoryId(categories[0].categoryId)
                .addCategoryId(categories[1].categoryId)
                .addCategoryId(categories[2].categoryId)
                .withName('TEST')
                .withCreatedAt(new Date(createdAt.getTime() + 3000))
                .build(),
            eee: Genre.fake()
                .aGenre()
                .addCategoryId(categories[3].categoryId)
                .withName('eee')
                .withCreatedAt(new Date(createdAt.getTime() + 4000))
                .build(),
            TeSt: Genre.fake()
                .aGenre()
                .addCategoryId(categories[1].categoryId)
                .addCategoryId(categories[2].categoryId)
                .withName('TeSt')
                .withCreatedAt(new Date(createdAt.getTime() + 5000))
                .build(),
        };

        const arrange_filter_by_name_sort_name_asc = [
            {
                send_data: {
                    page: 1,
                    perPage: 2,
                    sort: 'name',
                    filter: { name: 'TEST' },
                },
                get label() {
                    return JSON.stringify(this.send_data);
                },
                expected: {
                    entities: [entitiesMap.TEST, entitiesMap.TeSt],
                    meta: {
                        total: 3,
                        currentPage: 1,
                        lastPage: 2,
                        perPage: 2,
                    },
                },
            },
            {
                send_data: {
                    page: 2,
                    perPage: 2,
                    sort: 'name',
                    filter: { name: 'TEST' },
                },
                get label() {
                    return JSON.stringify(this.send_data);
                },
                expected: {
                    entities: [entitiesMap.test],
                    meta: {
                        total: 3,
                        currentPage: 2,
                        lastPage: 2,
                        perPage: 2,
                    },
                },
            },
        ];

        const arrange_filter_by_categoriesId_and_sort_by_created_desc = [
            {
                send_data: {
                    page: 1,
                    perPage: 2,
                    sort: 'createdAt',
                    sortDir: 'desc' as SortDirection,
                    filter: { categoriesId: [categories[0].categoryId.value] },
                },
                get label() {
                    return JSON.stringify({
                        ...this.send_data,
                        filter: { categoriesId_length: 1 },
                    });
                },
                expected: {
                    entities: [entitiesMap.TEST, entitiesMap.aaa],
                    meta: {
                        total: 3,
                        currentPage: 1,
                        lastPage: 2,
                        perPage: 2,
                    },
                },
            },
            {
                send_data: {
                    page: 2,
                    perPage: 2,
                    sort: 'createdAt',
                    sortDir: 'desc' as SortDirection,
                    filter: { categoriesId: [categories[0].categoryId.value] },
                },
                get label() {
                    return JSON.stringify({
                        ...this.send_data,
                        filter: { categoriesId_length: 1 },
                    });
                },
                expected: {
                    entities: [entitiesMap.test],
                    meta: {
                        total: 3,
                        currentPage: 2,
                        lastPage: 2,
                        perPage: 2,
                    },
                },
            },
            {
                send_data: {
                    page: 1,
                    perPage: 2,
                    sort: 'createdAt',
                    sortDir: 'desc' as SortDirection,
                    filter: {
                        categoriesId: [
                            categories[0].categoryId.value,
                            categories[1].categoryId.value,
                        ],
                    },
                },
                get label() {
                    return JSON.stringify({
                        ...this.send_data,
                        filter: { categoriesId_length: 2 },
                    });
                },
                expected: {
                    entities: [entitiesMap.TeSt, entitiesMap.TEST],
                    meta: {
                        total: 4,
                        currentPage: 1,
                        lastPage: 2,
                        perPage: 2,
                    },
                },
            },
            {
                send_data: {
                    page: 2,
                    perPage: 2,
                    sort: 'createdAt',
                    sortDir: 'desc' as SortDirection,
                    filter: {
                        categoriesId: [
                            categories[0].categoryId.value,
                            categories[1].categoryId.value,
                        ],
                    },
                },
                get label() {
                    return JSON.stringify({
                        ...this.send_data,
                        filter: { categoriesId_length: 2 },
                    });
                },
                expected: {
                    entities: [entitiesMap.aaa, entitiesMap.test],
                    meta: {
                        total: 4,
                        currentPage: 2,
                        lastPage: 2,
                        perPage: 2,
                    },
                },
            },
        ];

        return {
            arrange: [
                ...arrange_filter_by_name_sort_name_asc,
                ...arrange_filter_by_categoriesId_and_sort_by_created_desc,
            ],
            entitiesMap,
            relations,
        };
    }
}
