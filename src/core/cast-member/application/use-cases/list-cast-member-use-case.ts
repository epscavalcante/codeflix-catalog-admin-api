import IUseCase from "@core/shared/application/use-cases/use-case.interface";
import { ListCastMembersInput } from "./mappers/list-cast-member.use-case.input";
import PaginationOutput, { PaginationOutputType } from "@core/shared/application/use-cases/mappers/pagination-output";
import { CastMemberOutputType } from "./mappers/create-cast-member.use-case.output";
import CastMemberRepository, { CastMemberSearchParams, CastMemberSearchResult } from "@core/cast-member/domain/cast-member.repository.interface";
import CastMemberOutputMapper from "./mappers/cast-member-output.mapper";

export class ListCastMembersUseCase
    implements IUseCase<ListCastMembersInput, ListCastMembersOutput>
{
    constructor(private castMemberRepo: CastMemberRepository) {}

    async handle(input: ListCastMembersInput): Promise<ListCastMembersOutput> {
        const params = CastMemberSearchParams.create(input);
        const searchResult = await this.castMemberRepo.search(params);
        return this.toOutput(searchResult);
    }

    private toOutput(
        searchResult: CastMemberSearchResult,
    ): ListCastMembersOutput {
        const { items: _items } = searchResult;
        const items = _items.map((i) => {
            return CastMemberOutputMapper.toOutput(i);
        });
        return PaginationOutput.toOutput(items, searchResult);
    }
}

export type ListCastMembersOutput = PaginationOutputType<CastMemberOutputType>;
