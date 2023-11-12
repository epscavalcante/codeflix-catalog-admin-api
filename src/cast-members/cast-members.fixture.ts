import { CastMemberTypeEnum } from '@core/cast-member/domain/cast-member-type.value-object';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';

const _keysInResponse = ['id', 'name', 'type', 'createdAt'];

export class GetCastMemberFixture {
    static keysInResponse = _keysInResponse;
}

export class CreateCastMemberFixture {
    static keysInResponse = _keysInResponse;

    static arrangeForCreate() {
        return [
            {
                send_data: {
                    name: 'Actor',
                    type: CastMemberTypeEnum.ACTOR,
                },
                expected: {
                    name: 'Actor',
                    type: CastMemberTypeEnum.ACTOR,
                },
            },
            {
                send_data: {
                    name: 'Diretor',
                    type: CastMemberTypeEnum.DIRECTOR,
                },
                expected: {
                    name: 'Diretor',
                    type: CastMemberTypeEnum.DIRECTOR,
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
                        'type should not be empty',
                        'type must be an integer number',
                    ],
                    ...defaultExpected,
                },
            },
            NAME_UNDEFINED: {
                send_data: {
                    name: undefined,
                    type: 1,
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
                    type: 1,
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
                    type: 1,
                },
                expected: {
                    message: ['name should not be empty'],
                    ...defaultExpected,
                },
            },
            TYPE_UNDEFINED: {
                send_data: {
                    name: 'Test',
                    type: undefined,
                },
                expected: {
                    message: [
                        'type should not be empty',
                        'type must be an integer number',
                    ],
                    ...defaultExpected,
                },
            },
            TYPE_NULL: {
                send_data: {
                    name: 'Test',
                    type: null,
                },
                expected: {
                    message: [
                        'type should not be empty',
                        'type must be an integer number',
                    ],
                    ...defaultExpected,
                },
            },
            TYPE_EMPTY: {
                send_data: {
                    name: 'Test',
                    type: '',
                },
                expected: {
                    message: [
                        'type should not be empty',
                        'type must be an integer number',
                    ],
                    ...defaultExpected,
                },
            },
            TYPE_IS_NOT_NUMBER: {
                send_data: {
                    name: 'Test',
                    type: 'test',
                },
                expected: {
                    message: ['type must be an integer number'],
                    ...defaultExpected,
                },
            },
            TYPE_IS_NOT_VALID: {
                send_data: {
                    name: 'Test',
                    type: 9,
                },
                expected: {
                    message: ['Invalid cast member type: 9'],
                    ...defaultExpected,
                },
            },
        };
    }

    static arrangeForEntityValidationError() {
        const faker = CastMember.fake().aDirector();
        const defaultExpected = {
            statusCode: 422,
            error: 'Unprocessable Entity',
        };

        return {
            NAME_TOO_LONG: {
                send_data: {
                    name: faker.withInvalidNameTooLong().name,
                    type: 1,
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

export class UpdateCastMemberFixture {
    static keysInResponse = _keysInResponse;

    static arrangeForUpdate() {
        return [
            {
                send_data: {
                    name: 'Teste',
                    type: 1,
                },
                expected: {
                    name: 'Teste',
                    type: 1,
                },
            },
            {
                send_data: {
                    name: 'Teste',
                    type: 2,
                },
                expected: {
                    name: 'Teste',
                    type: 2,
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
            NAME_NOT_A_STRING: {
                send_data: {
                    name: 1234,
                    type: 1,
                },
                expected: {
                    message: ['name must be a string'],
                    ...defaultExpected,
                },
            },
            TYPE_NOT_A_NUMBER: {
                send_data: {
                    name: 'Test',
                    type: 'Test',
                },
                expected: {
                    message: ['type must be an integer number'],
                    ...defaultExpected,
                },
            },
        };
    }

    static arrangeForEntityValidationError() {
        const faker = CastMember.fake().aDirector();
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

export class ListCastMemberFixture {
    static arrangeIncrementedWithCreatedAt() {
        const _entities = CastMember.fake()
            .theActors(4)
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
        const directorFake = CastMember.fake().aDirector();
        const actorFake = CastMember.fake().anActor();
        const createdAt = new Date();

        const entitiesMap = {
            actor_a: actorFake
                .withCreatedAt(new Date(createdAt.getTime() + 1000))
                .withName('aaa')
                .build(),
            actor_AAA: actorFake
                .withCreatedAt(new Date(createdAt.getTime() + 2000))
                .withName('AAA')
                .build(),
            actor_AaA: actorFake
                .withCreatedAt(new Date(createdAt.getTime() + 3000))
                .withName('AaA')
                .build(),
            actor_b: actorFake
                .withCreatedAt(new Date(createdAt.getTime() + 4000))
                .withName('bbb')
                .build(),
            actor_c: actorFake
                .withCreatedAt(new Date(createdAt.getTime() + 5000))
                .withName('ccc')
                .build(),

            director_d: directorFake
                .withCreatedAt(new Date(createdAt.getTime() + 6000))
                .withName('ddd')
                .build(),
            director_e: directorFake
                .withCreatedAt(new Date(createdAt.getTime() + 7000))
                .withName('eee')
                .build(),
        };

        const arrangeFilteredByNameAndAscSortedByName = [
            {
                send_data: {
                    page: 1,
                    perPage: 2,
                    sort: 'name',
                    sortDir: 'asc' as SortDirection,
                    filter: { name: 'a' },
                },
                expected: {
                    entities: [entitiesMap.actor_AAA, entitiesMap.actor_AaA],
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
                    sortDir: 'asc' as SortDirection,
                    filter: { name: 'a' },
                },
                expected: {
                    entities: [entitiesMap.actor_a],
                    meta: {
                        currentPage: 2,
                        perPage: 2,
                        lastPage: 2,
                        total: 3,
                    },
                },
            },
        ];

        const arrangeFilteredByNameAndDescSortedByName = [
            {
                send_data: {
                    page: 1,
                    perPage: 2,
                    sort: 'name',
                    sortDir: 'desc' as SortDirection,
                    filter: { name: 'a' },
                },
                expected: {
                    entities: [entitiesMap.actor_a, entitiesMap.actor_AaA],
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
                    sortDir: 'desc' as SortDirection,
                    filter: { name: 'a' },
                },
                expected: {
                    entities: [entitiesMap.actor_AAA],
                    meta: {
                        currentPage: 2,
                        perPage: 2,
                        lastPage: 2,
                        total: 3,
                    },
                },
            },
        ];

        const arrangeFilteredByType = [
            {
                send_data: {
                    page: 1,
                    perPage: 2,
                    filter: { type: CastMemberTypeEnum.DIRECTOR },
                },
                expected: {
                    entities: [entitiesMap.director_e, entitiesMap.director_d],
                    meta: {
                        currentPage: 1,
                        perPage: 2,
                        lastPage: 1,
                        total: 2,
                    },
                },
            },
            {
                send_data: {
                    page: 1,
                    perPage: 15,
                    filter: { type: CastMemberTypeEnum.ACTOR },
                },
                expected: {
                    entities: [
                        entitiesMap.actor_AAA,
                        entitiesMap.actor_AaA,
                        entitiesMap.actor_a,
                        entitiesMap.actor_b,
                        entitiesMap.actor_c,
                    ],

                    meta: {
                        currentPage: 2,
                        perPage: 2,
                        lastPage: 2,
                        total: 3,
                    },
                },
            },
        ];

        return {
            arrangeFilteredByNameAndAscSortedByName,
            arrangeFilteredByNameAndDescSortedByName,
            arrangeFilteredByType,
            entitiesMap,
        };
    }
}
