import { validateSync } from 'class-validator';
import {
    ListCastMembersFilter,
    ListCastMembersInput,
} from '../mappers/list-cast-member.use-case.input';
import { CastMemberTypeEnum } from '@core/cast-member/domain/cast-member-type.value-object';

describe('ListCastMembersInput Unit Tests', () => {
    test('validate', () => {
        const input = new ListCastMembersInput();
        input.page = 1;
        input.perPage = 10;
        input.sort = 'name';
        input.sortDir = 'asc';
        const filter = new ListCastMembersFilter();
        filter.name = 'name';
        filter.type = CastMemberTypeEnum.ACTOR;
        input.filter = filter;

        const errors = validateSync(input);
        expect(errors.length).toBe(0);
    });

    test('invalidate', () => {
        const input = new ListCastMembersInput();
        input.page = 1;
        input.perPage = 10;
        input.sort = 'name';
        input.sortDir = 'asc';
        const filter = new ListCastMembersFilter();
        filter.name = 'name';
        filter.type = 'a' as any;
        input.filter = filter;

        const errors = validateSync(input);
        expect(errors.length).toBe(1);
    });
});
