import { CastMemberSearchResult } from '@core/cast-member/domain/cast-member.repository.interface';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import CastMemberOutputMapper from '../mappers/cast-member-output.mapper';
import { CastMemberTypeEnum } from '@core/cast-member/domain/cast-member-type.value-object';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import CastMemberSequelizeRepository from '@core/cast-member/infra/repositories/cast-member-sequelize.repository';
import ListCastMemberUseCase from '../list-cast-member-use-case';

describe('ListCastMemberUseCase Integration Tests', () => {
    let useCase: ListCastMemberUseCase;
    let repository: CastMemberSequelizeRepository;

    setupDatabase({
        models: [CastMemberModel],
    });

    beforeEach(() => {
        repository = new CastMemberSequelizeRepository(CastMemberModel);
        useCase = new ListCastMemberUseCase(repository);
    });

    test('toOutput method', () => {
        let result = new CastMemberSearchResult({
            items: [],
            total: 1,
            currentPage: 1,
            perPage: 2,
        });
        let output = useCase['toOutput'](result);
        expect(output).toStrictEqual({
            items: [],
            total: 1,
            currentPage: 1,
            perPage: 2,
            lastPage: 1,
        });

        const entity = CastMember.fake().anActor().build();
        result = new CastMemberSearchResult({
            items: [entity],
            total: 1,
            currentPage: 1,
            perPage: 2,
        });

        output = useCase['toOutput'](result);
        expect(output).toStrictEqual({
            items: [entity].map(CastMemberOutputMapper.toOutput),
            total: 1,
            currentPage: 1,
            perPage: 2,
            lastPage: 1,
        });
    });

    it('should search sorted by createdAt when input param is empty', async () => {
        const items = [
            CastMember.fake().anActor().build(),
            CastMember.fake()
                .anActor()
                .withCreatedAt(new Date(new Date().getTime() + 100))
                .build(),
        ];
        await repository.bulkInsert(items);

        const output = await useCase.handle({});
        expect(output).toStrictEqual({
            items: [...items].reverse().map(CastMemberOutputMapper.toOutput),
            total: 2,
            currentPage: 1,
            perPage: 15,
            lastPage: 1,
        });
    });

    it('should search applying paginate and filter by name', async () => {
        const createdAt = new Date();
        const castMembers = [
            CastMember.fake()
                .anActor()
                .withName('test')
                .withCreatedAt(createdAt)
                .build(),
            CastMember.fake()
                .anActor()
                .withName('aaa')
                .withCreatedAt(createdAt)
                .build(),
            CastMember.fake()
                .anActor()
                .withName('TEST')
                .withCreatedAt(createdAt)
                .build(),
            CastMember.fake()
                .anActor()
                .withName('TeSt')
                .withCreatedAt(createdAt)
                .build(),
        ];
        await repository.bulkInsert(castMembers);

        let output = await useCase.handle({
            page: 1,
            perPage: 2,
            filter: { name: 'TEST' },
        });
        expect(output).toStrictEqual({
            items: [castMembers[0], castMembers[2]].map(
                CastMemberOutputMapper.toOutput,
            ),
            total: 3,
            currentPage: 1,
            perPage: 2,
            lastPage: 2,
        });

        output = await useCase.handle({
            page: 2,
            perPage: 2,
            filter: { name: 'TEST' },
        });
        expect(output).toStrictEqual({
            items: [castMembers[3]].map(CastMemberOutputMapper.toOutput),
            total: 3,
            currentPage: 2,
            perPage: 2,
            lastPage: 2,
        });
    });

    it('should search applying paginate and filter by type', async () => {
        const createdAt = new Date();
        const castMembers = [
            CastMember.fake()
                .anActor()
                .withName('actor1')
                .withCreatedAt(createdAt)
                .build(),
            CastMember.fake()
                .anActor()
                .withName('actor2')
                .withCreatedAt(createdAt)
                .build(),
            CastMember.fake()
                .anActor()
                .withName('actor3')
                .withCreatedAt(createdAt)
                .build(),
            CastMember.fake()
                .aDirector()
                .withName('director1')
                .withCreatedAt(createdAt)
                .build(),
            CastMember.fake()
                .aDirector()
                .withName('director2')
                .withCreatedAt(createdAt)
                .build(),
            CastMember.fake()
                .aDirector()
                .withName('director3')
                .withCreatedAt(createdAt)
                .build(),
        ];
        await repository.bulkInsert(castMembers);

        const arrange = [
            {
                input: {
                    page: 1,
                    perPage: 2,
                    filter: { type: CastMemberTypeEnum.ACTOR },
                },
                output: {
                    items: [castMembers[0], castMembers[1]].map(
                        CastMemberOutputMapper.toOutput,
                    ),
                    total: 3,
                    currentPage: 1,
                    perPage: 2,
                    lastPage: 2,
                },
            },
            {
                input: {
                    page: 2,
                    perPage: 2,
                    filter: { type: CastMemberTypeEnum.ACTOR },
                },
                output: {
                    items: [castMembers[2]].map(
                        CastMemberOutputMapper.toOutput,
                    ),
                    total: 3,
                    currentPage: 2,
                    perPage: 2,
                    lastPage: 2,
                },
            },
            {
                input: {
                    page: 1,
                    perPage: 2,
                    filter: { type: CastMemberTypeEnum.DIRECTOR },
                },
                output: {
                    items: [castMembers[3], castMembers[4]].map(
                        CastMemberOutputMapper.toOutput,
                    ),
                    total: 3,
                    currentPage: 1,
                    perPage: 2,
                    lastPage: 2,
                },
            },
        ];

        for (const item of arrange) {
            const output = await useCase.handle(item.input);
            expect(output).toStrictEqual(item.output);
        }
    });

    it('should search applying paginate and sort', async () => {
        expect(repository.sortableFields).toStrictEqual(['name', 'createdAt']);

        const castMembers = [
            CastMember.fake().anActor().withName('bbb').build(),
            CastMember.fake().anActor().withName('aaa').build(),
            CastMember.fake().anActor().withName('ddd').build(),
            CastMember.fake().anActor().withName('eee').build(),
            CastMember.fake().anActor().withName('ccc').build(),
        ];
        await repository.bulkInsert(castMembers);

        const arrange = [
            {
                input: {
                    page: 1,
                    perPage: 2,
                    sort: 'name',
                },
                output: {
                    items: [castMembers[1], castMembers[0]].map(
                        CastMemberOutputMapper.toOutput,
                    ),
                    total: 5,
                    currentPage: 1,
                    perPage: 2,
                    lastPage: 3,
                },
            },
            {
                input: {
                    page: 2,
                    perPage: 2,
                    sort: 'name',
                },
                output: {
                    items: [castMembers[4], castMembers[2]].map(
                        CastMemberOutputMapper.toOutput,
                    ),
                    total: 5,
                    currentPage: 2,
                    perPage: 2,
                    lastPage: 3,
                },
            },
            {
                input: {
                    page: 1,
                    perPage: 2,
                    sort: 'name',
                    sortDir: 'desc' as SortDirection,
                },
                output: {
                    items: [castMembers[3], castMembers[2]].map(
                        CastMemberOutputMapper.toOutput,
                    ),
                    total: 5,
                    currentPage: 1,
                    perPage: 2,
                    lastPage: 3,
                },
            },
            {
                input: {
                    page: 2,
                    perPage: 2,
                    sort: 'name',
                    sortDir: 'desc' as SortDirection,
                },
                output: {
                    items: [castMembers[4], castMembers[0]].map(
                        CastMemberOutputMapper.toOutput,
                    ),
                    total: 5,
                    currentPage: 2,
                    perPage: 2,
                    lastPage: 3,
                },
            },
        ];

        for (const item of arrange) {
            const output = await useCase.handle(item.input);
            expect(output).toStrictEqual(item.output);
        }
    });

    describe('should search applying filter by name, sort and paginate', () => {
        const castMembers = [
            CastMember.fake().anActor().withName('test').build(),
            CastMember.fake().anActor().withName('aaa').build(),
            CastMember.fake().anActor().withName('TEST').build(),
            CastMember.fake().anActor().withName('eee').build(),
            CastMember.fake().aDirector().withName('TeSt').build(),
        ];

        const arrange = [
            {
                input: {
                    page: 1,
                    perPage: 2,
                    sort: 'name',
                    filter: { name: 'TEST' },
                },
                output: {
                    items: [castMembers[2], castMembers[4]].map(
                        CastMemberOutputMapper.toOutput,
                    ),
                    total: 3,
                    currentPage: 1,
                    perPage: 2,
                    lastPage: 2,
                },
            },
            {
                input: {
                    page: 2,
                    perPage: 2,
                    sort: 'name',
                    filter: { name: 'TEST' },
                },
                output: {
                    items: [castMembers[0]].map(
                        CastMemberOutputMapper.toOutput,
                    ),
                    total: 3,
                    currentPage: 2,
                    perPage: 2,
                    lastPage: 2,
                },
            },
        ];

        beforeEach(async () => {
            await repository.bulkInsert(castMembers);
        });

        test.each(arrange)(
            'when value is $search_params',
            async ({ input, output: expectedOutput }) => {
                const output = await useCase.handle(input);
                expect(output).toStrictEqual(expectedOutput);
            },
        );
    });

    describe('should search applying filter by type, sort and paginate', () => {
        const castMembers = [
            CastMember.fake().anActor().withName('test').build(),
            CastMember.fake().aDirector().withName('aaa').build(),
            CastMember.fake().anActor().withName('TEST').build(),
            CastMember.fake().aDirector().withName('eee').build(),
            CastMember.fake().anActor().withName('TeSt').build(),
            CastMember.fake().aDirector().withName('bbb').build(),
        ];

        const arrange = [
            {
                input: {
                    page: 1,
                    perPage: 2,
                    sort: 'name',
                    filter: { type: CastMemberTypeEnum.ACTOR },
                },
                output: {
                    items: [castMembers[2], castMembers[4]].map(
                        CastMemberOutputMapper.toOutput,
                    ),
                    total: 3,
                    currentPage: 1,
                    perPage: 2,
                    lastPage: 2,
                },
            },
            {
                input: {
                    page: 2,
                    perPage: 2,
                    sort: 'name',
                    filter: { type: CastMemberTypeEnum.ACTOR },
                },
                output: {
                    items: [castMembers[0]].map(
                        CastMemberOutputMapper.toOutput,
                    ),
                    total: 3,
                    currentPage: 2,
                    perPage: 2,
                    lastPage: 2,
                },
            },
            {
                input: {
                    page: 1,
                    perPage: 2,
                    sort: 'name',
                    filter: { type: CastMemberTypeEnum.DIRECTOR },
                },
                output: {
                    items: [castMembers[1], castMembers[5]].map(
                        CastMemberOutputMapper.toOutput,
                    ),
                    total: 3,
                    currentPage: 1,
                    perPage: 2,
                    lastPage: 2,
                },
            },
            {
                input: {
                    page: 2,
                    perPage: 2,
                    sort: 'name',
                    filter: { type: CastMemberTypeEnum.DIRECTOR },
                },
                output: {
                    items: [castMembers[3]].map(
                        CastMemberOutputMapper.toOutput,
                    ),
                    total: 3,
                    currentPage: 2,
                    perPage: 2,
                    lastPage: 2,
                },
            },
        ];

        beforeEach(async () => {
            await repository.bulkInsert(castMembers);
        });

        test.each(arrange)(
            'when value is $search_params',
            async ({ input, output: expectedOutput }) => {
                const output = await useCase.handle(input);
                expect(output).toStrictEqual(expectedOutput);
            },
        );
    });

    it('should search using filter by name and type, sort and paginate', async () => {
        const castMembers = [
            CastMember.fake().anActor().withName('test').build(),
            CastMember.fake().aDirector().withName('a director').build(),
            CastMember.fake().anActor().withName('TEST').build(),
            CastMember.fake().aDirector().withName('e director').build(),
            CastMember.fake().anActor().withName('TeSt').build(),
            CastMember.fake().aDirector().withName('b director').build(),
        ];
        await repository.bulkInsert(castMembers);

        let output = await useCase.handle({
            page: 1,
            perPage: 2,
            sort: 'name',
            filter: { name: 'TEST', type: CastMemberTypeEnum.ACTOR },
        });
        expect(output).toStrictEqual({
            items: [castMembers[2], castMembers[4]].map(
                CastMemberOutputMapper.toOutput,
            ),
            total: 3,
            currentPage: 1,
            perPage: 2,
            lastPage: 2,
        });

        output = await useCase.handle({
            page: 2,
            perPage: 2,
            sort: 'name',
            filter: { name: 'TEST', type: CastMemberTypeEnum.ACTOR },
        });
        expect(output).toStrictEqual({
            items: [castMembers[0]].map(CastMemberOutputMapper.toOutput),
            total: 3,
            currentPage: 2,
            perPage: 2,
            lastPage: 2,
        });

        output = await useCase.handle({
            page: 1,
            perPage: 2,
            sort: 'name',
            sortDir: 'asc',
            filter: { name: 'director', type: CastMemberTypeEnum.DIRECTOR },
        });
        expect(output).toStrictEqual({
            items: [castMembers[1], castMembers[5]].map(
                CastMemberOutputMapper.toOutput,
            ),
            total: 3,
            currentPage: 1,
            perPage: 2,
            lastPage: 2,
        });

        output = await useCase.handle({
            page: 2,
            perPage: 2,
            sort: 'name',
            sortDir: 'asc',
            filter: { name: 'director', type: CastMemberTypeEnum.DIRECTOR },
        });
        expect(output).toStrictEqual({
            items: [castMembers[3]].map(CastMemberOutputMapper.toOutput),
            total: 3,
            currentPage: 2,
            perPage: 2,
            lastPage: 2,
        });
    });
});
