import ICategoryRepository, {
    CategoryFilter,
    CategorySearchParams,
    CategorySearchResult,
} from "../../../domain/repositories/category.repository";
import Category from "../../../domain/entities/category.entity";
import IUseCase from "../use-case";
import CategoryOutput, { CategoryOutputType } from "../mappers/category-output";
import { SortDirection } from "../../../domain/repositories/searchable.repository";
import PaginationOutput, { PaginationOutputType } from "../mappers/pagination-output";

export default class ListCategoryUseCase
    implements IUseCase<ListCategoryInput, ListCategoryOutput>
{
    constructor(private readonly repository: ICategoryRepository) {}

    async handle(input: ListCategoryInput): Promise<ListCategoryOutput> {
        const searchParams = new CategorySearchParams(input);
        const searchResult = await this.repository.search(searchParams);

        return this.toOutput(searchResult);
    }

    private toOutput(searchResult: CategorySearchResult): ListCategoryOutput {
        const { items: _items } = searchResult;

        const items = _items.map((item) => CategoryOutput.toOutput(item));

        return PaginationOutput.toOutput(items, searchResult);
    }
}

export type ListCategoryInput = {
    page?: number;
    perPage?: number;
    sort?: string | null;
    sortDir?: SortDirection | null;
    filter?: CategoryFilter | null;
};

export type ListCategoryOutput = PaginationOutputType<CategoryOutputType>;
