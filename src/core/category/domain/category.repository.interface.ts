import Category, { CategoryId } from './category.aggregate';
import ISearchableRepository, {
    SearchParams,
    SearchResult,
} from '@core/shared/domain/repositories/searchable.repository.interface';

export type CategoryFilter = string;

export class CategorySearchParams extends SearchParams<CategoryFilter> {}

export class CategorySearchResult extends SearchResult<Category> {}

export default interface ICategoryRepository
    extends ISearchableRepository<
        Category,
        CategoryId,
        CategoryFilter,
        CategorySearchParams,
        CategorySearchResult
    > {}
