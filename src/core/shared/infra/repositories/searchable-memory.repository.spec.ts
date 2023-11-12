import {
    SearchParams,
    SearchResult,
} from '../../domain/repositories/searchable.repository.interface';
import Entity from '../../domain/entity';
import Uuid from '../../domain/value-objects/uuid.vo';
import { SearchableMemoryRepository } from './searchable-memory.repository';

type EntityStubProps = {
    entityId?: Uuid;
    name: string;
    price: number;
};

class EntityStub extends Entity {
    entityId: Uuid;
    name: string;
    price: number;

    constructor(props: EntityStubProps) {
        super();
        this.entityId = props.entityId || new Uuid();
        this.name = props.name;
        this.price = props.price;
    }

    toJSON() {
        return {
            entityId: this.entityId.value,
            name: this.name,
            price: this.price,
        };
    }
}

class StubSearchableMemoryRepository extends SearchableMemoryRepository<
    EntityStub,
    Uuid
> {
    sortableFields: string[] = ['name'];

    getEntity(): new (...args: any[]) => EntityStub {
        return EntityStub;
    }

    protected async applyFilter(
        items: EntityStub[],
        filter: string | null,
    ): Promise<EntityStub[]> {
        if (!filter) return items;

        return items.filter((item) => {
            return (
                item.name.toLowerCase().includes(filter.toLowerCase()) ||
                item.price.toString() === filter
            );
        });
    }
}

describe('Searchable Memomy UnitTests', () => {
    let repository: StubSearchableMemoryRepository;

    beforeEach(() => (repository = new StubSearchableMemoryRepository()));

    describe('ApplyFilters method', () => {
        test('Should not filter when filter param is null', async () => {
            const items = [new EntityStub({ name: 'test', price: 10 })];
            const spyFilterMethod = jest.spyOn(items, 'filter' as any);
            const itemsFiltered = await repository['applyFilter'](items, null);
            expect(itemsFiltered).toStrictEqual(items);
            expect(spyFilterMethod).not.toHaveBeenCalled();
        });

        test('Should filter items', async () => {
            const items = [
                new EntityStub({ name: 'test', price: 10 }),
                new EntityStub({ name: 'hello world', price: 25 }),
                new EntityStub({ name: 'TEST', price: 0 }),
            ];
            const spyFilterMethod = jest.spyOn(items, 'filter' as any);

            let itemsFiltered = await repository['applyFilter'](items, 'test');
            expect(itemsFiltered).toStrictEqual([items[0], items[2]]);
            expect(spyFilterMethod).toHaveBeenCalledTimes(1);

            itemsFiltered = await repository['applyFilter'](
                items,
                'hello world',
            );
            expect(itemsFiltered).toStrictEqual([items[1]]);
            expect(spyFilterMethod).toHaveBeenCalledTimes(2);

            itemsFiltered = await repository['applyFilter'](items, '0');
            expect(itemsFiltered).toStrictEqual([items[2]]);
            expect(spyFilterMethod).toHaveBeenCalledTimes(3);

            itemsFiltered = await repository['applyFilter'](items, 'not-exist');
            expect(itemsFiltered).toHaveLength(0);
            expect(spyFilterMethod).toHaveBeenCalledTimes(4);
        });
    });

    describe('ApplySorting', () => {
        test('Should not sort items', async () => {
            const items = [
                new EntityStub({ name: 'b', price: 5 }),
                new EntityStub({ name: 'a', price: 5 }),
            ];

            let itemsSorted = await repository['applySorting'](
                items,
                null,
                null,
            );
            expect(itemsSorted).toStrictEqual(items);

            itemsSorted = await repository['applySorting'](
                items,
                'price',
                'asc',
            );
            expect(itemsSorted).toStrictEqual(items);
        });

        it('Should sort items', async () => {
            const items = [
                new EntityStub({ name: 'b', price: 5 }),
                new EntityStub({ name: 'a', price: 5 }),
                new EntityStub({ name: 'c', price: 5 }),
            ];

            let itemsSorted = await repository['applySorting'](
                items,
                'name',
                'asc',
            );
            expect(itemsSorted).toStrictEqual([items[1], items[0], items[2]]);

            itemsSorted = await repository['applySorting'](
                items,
                'name',
                'desc',
            );
            expect(itemsSorted).toStrictEqual([items[2], items[0], items[1]]);
        });
    });

    describe('ApplyPagination', () => {
        it('should paginate items', async () => {
            const items = [
                new EntityStub({ name: 'a', price: 5 }),
                new EntityStub({ name: 'b', price: 5 }),
                new EntityStub({ name: 'c', price: 5 }),
                new EntityStub({ name: 'd', price: 5 }),
                new EntityStub({ name: 'e', price: 5 }),
            ];

            let itemsPaginated = await repository['applyPagination'](
                items,
                1,
                2,
            );
            expect(itemsPaginated).toStrictEqual([items[0], items[1]]);

            itemsPaginated = await repository['applyPagination'](items, 2, 2);
            expect(itemsPaginated).toStrictEqual([items[2], items[3]]);

            itemsPaginated = await repository['applyPagination'](items, 3, 2);
            expect(itemsPaginated).toStrictEqual([items[4]]);

            itemsPaginated = await repository['applyPagination'](items, 4, 2);
            expect(itemsPaginated).toStrictEqual([]);
        });
    });

    describe('ApplySearch', () => {
        it('should apply only paginate when other params are null', async () => {
            const entity = new EntityStub({ name: 'a', price: 5 });
            const items = Array(16).fill(entity);
            repository.items = items;

            const result = await repository.search(new SearchParams());
            expect(result).toStrictEqual(
                new SearchResult({
                    items: Array(15).fill(entity),
                    total: 16,
                    currentPage: 1,
                    perPage: 15,
                }),
            );
        });

        it('should apply paginate and filter', async () => {
            const items = [
                new EntityStub({ name: 'test', price: 5 }),
                new EntityStub({ name: 'a', price: 5 }),
                new EntityStub({ name: 'TEST', price: 5 }),
                new EntityStub({ name: 'TeSt', price: 5 }),
            ];
            repository.items = items;

            let result = await repository.search(
                new SearchParams({ page: 1, perPage: 2, filter: 'TEST' }),
            );
            expect(result).toStrictEqual(
                new SearchResult({
                    items: [items[0], items[2]],
                    total: 3,
                    currentPage: 1,
                    perPage: 2,
                }),
            );

            result = await repository.search(
                new SearchParams({ page: 2, perPage: 2, filter: 'TEST' }),
            );
            expect(result).toStrictEqual(
                new SearchResult({
                    items: [items[3]],
                    total: 3,
                    currentPage: 2,
                    perPage: 2,
                }),
            );
        });

        describe('should apply paginate and sort', () => {
            const items = [
                new EntityStub({ name: 'b', price: 5 }),
                new EntityStub({ name: 'a', price: 5 }),
                new EntityStub({ name: 'd', price: 5 }),
                new EntityStub({ name: 'e', price: 5 }),
                new EntityStub({ name: 'c', price: 5 }),
            ];
            const arrange = [
                {
                    search_params: new SearchParams({
                        page: 1,
                        perPage: 2,
                        sort: 'name',
                    }),
                    search_result: new SearchResult({
                        items: [items[1], items[0]],
                        total: 5,
                        currentPage: 1,
                        perPage: 2,
                    }),
                },
                {
                    search_params: new SearchParams({
                        page: 2,
                        perPage: 2,
                        sort: 'name',
                    }),
                    search_result: new SearchResult({
                        items: [items[4], items[2]],
                        total: 5,
                        currentPage: 2,
                        perPage: 2,
                    }),
                },
                {
                    search_params: new SearchParams({
                        page: 1,
                        perPage: 2,
                        sort: 'name',
                        sortDir: 'desc',
                    }),
                    search_result: new SearchResult({
                        items: [items[3], items[2]],
                        total: 5,
                        currentPage: 1,
                        perPage: 2,
                    }),
                },
                {
                    search_params: new SearchParams({
                        page: 2,
                        perPage: 2,
                        sort: 'name',
                        sortDir: 'desc',
                    }),
                    search_result: new SearchResult({
                        items: [items[4], items[0]],
                        total: 5,
                        currentPage: 2,
                        perPage: 2,
                    }),
                },
            ];

            beforeEach(() => {
                repository.items = items;
            });

            test.each(arrange)(
                'when value is %j',
                async ({ search_params, search_result }) => {
                    const result = await repository.search(search_params);
                    expect(result).toStrictEqual(search_result);
                },
            );
        });

        it('should search using filter, sort and paginate', async () => {
            const items = [
                new EntityStub({ name: 'test', price: 5 }),
                new EntityStub({ name: 'a', price: 5 }),
                new EntityStub({ name: 'TEST', price: 5 }),
                new EntityStub({ name: 'e', price: 5 }),
                new EntityStub({ name: 'TeSt', price: 5 }),
            ];
            repository.items = items;

            const arrange = [
                {
                    params: new SearchParams({
                        page: 1,
                        perPage: 2,
                        sort: 'name',
                        filter: 'TEST',
                    }),
                    result: new SearchResult({
                        items: [items[2], items[4]],
                        total: 3,
                        currentPage: 1,
                        perPage: 2,
                    }),
                },
                {
                    params: new SearchParams({
                        page: 2,
                        perPage: 2,
                        sort: 'name',
                        filter: 'TEST',
                    }),
                    result: new SearchResult({
                        items: [items[0]],
                        total: 3,
                        currentPage: 2,
                        perPage: 2,
                    }),
                },
            ];

            for (const i of arrange) {
                const result = await repository.search(i.params);
                expect(result).toStrictEqual(i.result);
            }
        });
    });
});
