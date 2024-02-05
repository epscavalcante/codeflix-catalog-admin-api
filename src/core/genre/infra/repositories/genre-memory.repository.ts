import Genre from '@core/genre/domain/genre.aggregate';
import GenreId from '@core/genre/domain/genre.id.vo';
import IGenreRepository, {
    GenreFilter,
} from '@core/genre/domain/genre.repository.interface';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';
import { SearchableMemoryRepository } from '@core/shared/infra/repositories/searchable-memory.repository';

export default class GenreMemoryRepository
    extends SearchableMemoryRepository<Genre, GenreId, GenreFilter>
    implements IGenreRepository
{
    sortableFields: string[] = ['name', 'createdAt'];

    getEntity(): new (...args: any[]) => Genre {
        return Genre;
    }

    async applyFilter(items: Genre[], filter: GenreFilter): Promise<Genre[]> {
        if (!filter) return items;

        return items.filter((genre) => {
            const containsName =
                filter.name &&
                genre.name.toLowerCase().includes(filter.name!.toLowerCase());
            const containsCategoryId =
                filter.categoriesId &&
                filter.categoriesId.some((categoryId) =>
                    genre.categoriesId.has(categoryId.value),
                );

            return filter.name && filter.categoriesId
                ? containsName && containsCategoryId
                : filter.name
                ? containsName
                : containsCategoryId;
        });
    }

    protected applySorting(
        items: Genre[],
        sort: string | null,
        sortDir: SortDirection | null,
    ): Genre[] {
        return sort
            ? super.applySorting(items, sort, sortDir)
            : super.applySorting(items, 'createdAt', 'desc');
    }

    async findByIds(ids: GenreId[]): Promise<Genre[]> {
        //avoid to return repeated items
        return this.items.filter((entity) => {
            return ids.some((id) => entity.genreId.equals(id));
        });
    }

    async existsByIds(
        ids: GenreId[],
    ): Promise<{ exists: GenreId[]; notExists: GenreId[] }> {
        if (this.items.length === 0) {
            return {
                exists: [],
                notExists: ids,
            };
        }

        const existsId = new Set<GenreId>();
        const notExistsId = new Set<GenreId>();
        ids.forEach((id) => {
            const item = this.items.find((entity) => entity.genreId.equals(id));
            item ? existsId.add(id) : notExistsId.add(id);
        });
        return {
            exists: Array.from(existsId.values()),
            notExists: Array.from(notExistsId.values()),
        };
    }
}
