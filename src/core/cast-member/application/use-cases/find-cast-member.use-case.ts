import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import CastMemberOutputMapper from './mappers/cast-member-output.mapper';
import CastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import { CastMemberOutputType } from './mappers/create-cast-member.use-case.output';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberNotFoundError } from '@core/cast-member/domain/errors/cast-member-not-found.error';

export default class FindCastMemberUseCase
    implements IUseCase<FindCastMemberInput, FindCastMemberOutput>
{
    constructor(private readonly repository: CastMemberRepository) {}

    async handle(input: FindCastMemberInput): Promise<FindCastMemberOutput> {
        const id = new CastMemberId(input.id);
        const castMemberFound = await this.repository.findById(id);

        if (!castMemberFound)
            throw new CastMemberNotFoundError(id.value);

        return CastMemberOutputMapper.toOutput(castMemberFound);
    }
}

export type FindCastMemberInput = {
    id: string;
};

export type FindCastMemberOutput = CastMemberOutputType;
