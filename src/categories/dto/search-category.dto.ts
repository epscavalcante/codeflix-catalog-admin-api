import { ListCategoryInput } from "@core/category/application/use-cases/list-category.use-case";
import { SortDirection } from "@core/shared/domain/repositories/searchable.repository.interface";

export default class SearchCategoryDto implements ListCategoryInput {
    page?: number;
    perPage?: number;
    sort?: string;
    sortDir?: SortDirection;
    filter?: string;
}
