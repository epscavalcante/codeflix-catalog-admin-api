import Category, { CategoryId } from "@core/category/domain/category.aggregate";
import ICategoryRepository, { CategoryFilter } from "@core/category/domain/category.repository.interface";
import { SortDirection } from "@core/shared/domain/repositories/searchable.repository.interface";
import { SearchableMemoryRepository } from "@core/shared/infra/repositories/searchable-memory.repository";

export default class CategoryMemoryRepository
    extends SearchableMemoryRepository<Category, CategoryId, CategoryFilter>
    implements ICategoryRepository
{
    sortableFields: string[] = ['name', 'createdAt'];

    async applyFilter(
        items: Category[],
        filter: CategoryFilter,
    ): Promise<Category[]> {
        if (!filter) return items;

        return items.filter((item) =>
            item.name.toLowerCase().includes(filter.toLowerCase()),
        );
    }

    protected applySorting(
        items: Category[],
        sort: string,
        sortDir: SortDirection,
    ): Category[] {
        return sort
            ? super.applySorting(items, sort, sortDir)
            : super.applySorting(items, 'createdAt', 'desc');
    }

    getEntity(): new (...args: any[]) => Category {
        return Category;
    }
}
