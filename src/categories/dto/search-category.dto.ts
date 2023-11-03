import { SortDirection } from '../../core/domain/repositories/searchable.repository.interface';
import { ListCategoryInput } from '../../core/application/use-cases/category/list-category.use-case';

export default class SearchCategoryDto implements ListCategoryInput {
    page?: number;
    perPage?: number;
    sort?: string;
    sortDir?: SortDirection;
    filter?: string;
}
