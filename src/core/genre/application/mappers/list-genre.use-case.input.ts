import { IsArray, IsUUID, ValidateNested, validateSync } from 'class-validator';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';
import { SearchInput } from '@core/shared/application/use-cases/mappers/search-input';

export class ListGenreFilter {
    name?: string;

    @IsUUID('4', { each: true })
    @IsArray()
    categoriesId?: string[];
}

export class ListGenreInput implements SearchInput<ListGenreFilter> {
    page?: number;
    perPage?: number;
    sort?: string;
    sortDir?: SortDirection;
    @ValidateNested()
    filter?: ListGenreFilter;
}

export class ValidateListGenreInput {
    static validate(input: ListGenreInput) {
        return validateSync(input);
    }
}
