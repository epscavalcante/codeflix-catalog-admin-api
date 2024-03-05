import { SearchInput } from '@core/shared/application/use-cases/mappers/search-input';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';
import { IsArray, IsUUID, ValidateNested, validateSync } from 'class-validator';

// export type ListVideoInputType = {
//     page?: number;
//     perPage?: number;
//     sort?: string | null;
//     sortDir?: SortDirection | null;
//     filter?: VideoFilter | null;
// };

export class ListVideoFilter {
    title?: string;

    @IsUUID('4', { each: true })
    @IsArray()
    genresId?: string[];

    @IsUUID('4', { each: true })
    @IsArray()
    categoriesId?: string[];

    @IsUUID('4', { each: true })
    @IsArray()
    castMembersId?: string[];
}

export class ListVideoInput implements SearchInput<ListVideoFilter> {
    page?: number;
    perPage?: number;
    sort?: string;
    sortDir?: SortDirection;
    @ValidateNested()
    filter?: ListVideoFilter | null;
}

export class ValidateListVideoInput {
    static validate(input: ListVideoInput) {
        return validateSync(input);
    }
}
