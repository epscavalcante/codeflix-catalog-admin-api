import Category, { CategoryId } from '../entities/category.aggregate';
import ISearchableRepository, {
    SearchParams,
    SearchResult,
} from './searchable.repository.interface';

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
