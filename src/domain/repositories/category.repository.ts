import Category from "../entities/category.entity";
import IRepository from "./repository";
import Uuid from "../value-objects/uuid.vo";
import ISearchableRepository, {
    SearchParams,
    SearchResult,
} from "./searchable.repository";

export type CategoryFilter = string;

export class CategorySearchParams extends SearchParams<CategoryFilter> {}

export class CategorySearchResult extends SearchResult<Category> {}

export default interface ICategoryRepository
    extends ISearchableRepository<
        Category,
        Uuid,
        CategoryFilter,
        CategorySearchParams,
        CategorySearchResult
    > {}
