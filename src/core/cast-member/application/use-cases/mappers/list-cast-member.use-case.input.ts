import { IsInt, ValidateNested, validateSync } from 'class-validator';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';
import { CastMemberTypeEnum } from '@core/cast-member/domain/cast-member-type.value-object';
import { SearchInput } from '@core/shared/application/use-cases/mappers/search-input';

export class ListCastMembersFilter {
    name?: string;
    @IsInt()
    type?: CastMemberTypeEnum;
}

export class ListCastMembersInput
    implements SearchInput<ListCastMembersFilter>
{
    page?: number;
    perPage?: number;
    sort?: string;
    sortDir?: SortDirection;
    @ValidateNested()
    filter?: ListCastMembersFilter;
}

export class ValidateListCastMembersInput {
    static validate(input: ListCastMembersInput) {
        return validateSync(input);
    }
}
