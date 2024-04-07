import ISearchableRepository, {
    SearchParams,
    SearchResult,
    SortDirection,
} from '../../domain/repositories/searchable.repository.interface';
import Entity from '../../domain/entity';
import ValueObject from '../../domain/value-objects/value-object';
import MemoryRespository from './memory.repository';

export abstract class SearchableMemoryRepository<
        E extends Entity,
        Uuid extends ValueObject,
        Filter = string,
    >
    extends MemoryRespository<E, Uuid>
    implements ISearchableRepository<E, Uuid, Filter>
{
    sortableFields: string[] = [];

    async search(props: SearchParams<Filter>): Promise<SearchResult<E>> {
        const itemsFiltered = await this.applyFilter(this.items, props.filter);
        const itemsSorted = await this.applySorting(
            itemsFiltered,
            props.sort,
            props?.sortDir,
        );
        const itemsPaginated = await this.applyPagination(
            itemsSorted,
            props.page,
            props.perPage,
        );

        return new SearchResult({
            total: itemsFiltered.length,
            items: itemsPaginated,
            perPage: props.perPage,
            currentPage: props.page,
        });
    }

    protected abstract applyFilter(
        items: E[],
        filter?: Filter | null,
    ): Promise<E[]>;

    protected applySorting(
        items: E[],
        sort: string | null,
        sortDir: SortDirection | null,
        customSort?: (sort: string, item: E) => any,
    ): E[] {
        if (!sort || !this.sortableFields.includes(sort)) {
            return items;
        }

        return [...items].sort((a, b) => {
            const aValue = customSort ? customSort(sort, a) : a[sort];
            const bValue = customSort ? customSort(sort, b) : b[sort];

            if (aValue < bValue) {
                return sortDir === 'asc' ? -1 : 1;
            }

            if (aValue > bValue) {
                return sortDir === 'asc' ? 1 : -1;
            }

            return 0;
        });
    }

    protected applyPagination(
        items: E[],
        page: SearchParams['page'],
        perPage: SearchParams['perPage'],
    ): E[] {
        const start = (page - 1) * perPage;
        const limit = start + perPage;

        return items.slice(start, limit);
    }

    abstract getEntity(): new (...args: any[]) => E;
}
