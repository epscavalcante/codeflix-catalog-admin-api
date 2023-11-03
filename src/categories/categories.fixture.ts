import Category from '../core/domain/entities/category.aggregate';

const _keysInResponse = ['id', 'name', 'description', 'isActive', 'created_at'];

export class GetCategoryFixture {
    static keysInResponse = _keysInResponse;
}

export class CreateCategoryFixture {
    static keysInResponse = _keysInResponse;

    static arrangeForCreate() {
        const faker = Category.fake()
            .aCategory()
            .withName('Movie')
            .withDescription('description test');
        return [
            {
                send_data: {
                    name: faker.name,
                },
                expected: {
                    name: faker.name,
                    description: null,
                    isActive: true,
                },
            },
            {
                send_data: {
                    name: faker.name,
                    description: faker.description,
                },
                expected: {
                    name: faker.name,
                    description: faker.description,
                    isActive: true,
                },
            },
            {
                send_data: {
                    name: faker.name,
                    isActive: true,
                },
                expected: {
                    name: faker.name,
                    description: null,
                    isActive: true,
                },
            },
            {
                send_data: {
                    name: faker.name,
                    isActive: false,
                },
                expected: {
                    name: faker.name,
                    description: null,
                    isActive: false,
                },
            },
            {
                send_data: {
                    name: faker.name,
                    description: faker.description,
                    isActive: true,
                },
                expected: {
                    name: faker.name,
                    description: faker.description,
                    isActive: true,
                },
            },
        ];
    }

    static arrangeInvalidRequest() {
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
                    ],
                    ...defaultExpected,
                },
            },
            NAME_UNDEFINED: {
                send_data: {
                    name: undefined,
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
                },
                expected: {
                    message: ['name should not be empty'],
                    ...defaultExpected,
                },
            },
            DESCRIPTION_NOT_A_STRING: {
                send_data: {
                    description: 5,
                },
                expected: {
                    message: [
                        'name should not be empty',
                        'name must be a string',
                        'description must be a string',
                    ],
                    ...defaultExpected,
                },
            },
            IS_ACTIVE_NOT_A_BOOLEAN: {
                send_data: {
                    isActive: 'a',
                },
                expected: {
                    message: [
                        'name should not be empty',
                        'name must be a string',
                        'isActive must be a boolean value',
                    ],
                    ...defaultExpected,
                },
            },
        };
    }

    static arrangeForEntityValidationException() {
        const faker = Category.fake().aCategory();
        const defaultExpected = {
            statusCode: 422,
            error: 'Unprocessable Entity',
        };

        return {
            NAME_TOO_LONG: {
                send_data: {
                    name: faker.withInvalidNameTooLong().name,
                },
                expected: {
                    message: [
                        'name must be shorter than or equal to 255 characters',
                    ],
                    ...defaultExpected,
                },
            },
        };
    }
}

export class UpdateCategoryFixture {
    static keysInResponse = _keysInResponse;

    static arrangeForUpdate() {
        const faker = Category.fake()
            .aCategory()
            .withName('Movie')
            .withDescription('description test');
        return [
            {
                send_data: {
                    name: faker.name,
                    description: null,
                    isActive: true,
                },
                expected: {
                    name: faker.name,
                    description: null,
                    isActive: true,
                },
            },
            {
                send_data: {
                    name: faker.name,
                    description: faker.description,
                },
                expected: {
                    name: faker.name,
                    description: faker.description,
                    isActive: true,
                },
            },
            {
                send_data: {
                    name: faker.name,
                    isActive: false,
                },
                expected: {
                    name: faker.name,
                    isActive: false,
                },
            },
        ];
    }

    static arrangeInvalidRequest() {
        const defaultExpected = {
            statusCode: 422,
            error: 'Unprocessable Entity',
        };

        return {
            DESCRIPTION_NOT_A_STRING: {
                send_data: {
                    description: 5,
                },
                expected: {
                    message: ['description must be a string'],
                    ...defaultExpected,
                },
            },
            IS_ACTIVE_NOT_A_BOOLEAN: {
                send_data: {
                    isActive: 'a',
                },
                expected: {
                    message: ['isActive must be a boolean value'],
                    ...defaultExpected,
                },
            },
        };
    }

    static arrangeForEntityValidationException() {
        const faker = Category.fake().aCategory();
        const defaultExpected = {
            statusCode: 422,
            error: 'Unprocessable Entity',
        };

        return {
            NAME_TOO_LONG: {
                send_data: {
                    name: faker.withInvalidNameTooLong().name,
                },
                expected: {
                    message: [
                        'name must be shorter than or equal to 255 characters',
                    ],
                    ...defaultExpected,
                },
            },
        };
    }
}

export class ListCategoriesFixture {
    static arrangeIncrementedWithCreatedAt() {
        const _entities = Category.fake()
            .theCategories(4)
            .withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))
            .build();

        const entitiesMap = {
            first: _entities[0],
            second: _entities[1],
            third: _entities[2],
            fourth: _entities[3],
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

        return { arrange, entitiesMap };
    }

    static arrangeUnsorted() {
        const faker = Category.fake().aCategory();

        const entitiesMap = {
            a: faker.withName('aaa').build(),
            AAA: faker.withName('AAA').build(),
            AaA: faker.withName('AaA').build(),
            b: faker.withName('bbb').build(),
            c: faker.withName('ccc').build(),
        };

        const arrange = [
            {
                send_data: {
                    page: 1,
                    perPage: 2,
                    sort: 'name',
                    filter: 'a',
                },
                expected: {
                    entities: [entitiesMap.AAA, entitiesMap.AaA],
                    meta: {
                        currentPage: 1,
                        perPage: 2,
                        lastPage: 2,
                        total: 3,
                    },
                },
            },
            {
                send_data: {
                    page: 2,
                    perPage: 2,
                    sort: 'name',
                    filter: 'a',
                },
                expected: {
                    entities: [entitiesMap.a],
                    meta: {
                        currentPage: 2,
                        perPage: 2,
                        lastPage: 2,
                        total: 3,
                    },
                },
            },
        ];

        return { arrange, entitiesMap };
    }
}
