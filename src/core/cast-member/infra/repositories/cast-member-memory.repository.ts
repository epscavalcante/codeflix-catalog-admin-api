import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import CastMemberRepository, {
    CastMemberFilter,
} from '@core/cast-member/domain/cast-member.repository.interface';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';
import { SearchableMemoryRepository } from '@core/shared/infra/repositories/searchable-memory.repository';

export default class CastMemberMemoryRepository
    extends SearchableMemoryRepository<
        CastMember,
        CastMemberId,
        CastMemberFilter
    >
    implements CastMemberRepository
{
    sortableFields: string[] = ['name', 'createdAt'];

    async applyFilter(
        items: CastMember[],
        filter?: CastMemberFilter,
    ): Promise<CastMember[]> {
        if (!filter) return items;

        return items.filter((item) => {
            const containsType = filter.type && item.type.equals(filter.type);
            const containsName =
                filter.name &&
                item.name.toLowerCase().includes(filter.name.toLowerCase());

            return filter.name && filter.type
                ? containsName && containsType
                : filter.name
                ? containsName
                : containsType;
        });
    }

    protected applySorting(
        items: CastMember[],
        sort: string | null,
        sortDir: SortDirection | null,
    ): CastMember[] {
        return sort
            ? super.applySorting(items, sort, sortDir)
            : super.applySorting(items, 'createdAt', 'desc');
    }

    getEntity(): new (...args: any[]) => CastMember {
        return CastMember;
    }
}
