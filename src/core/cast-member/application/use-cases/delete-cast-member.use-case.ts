import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import CastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import IUseCase from '@core/shared/application/use-cases/use-case.interface';

export default class DeleteCastMemberUseCase
    implements IUseCase<DeleteCastMemberInput, DeleteCastMemberOutput>
{
    constructor(private readonly repository: CastMemberRepository) {}

    async handle(
        input: DeleteCastMemberInput,
    ): Promise<DeleteCastMemberOutput> {
        await this.repository.delete(new CastMemberId(input.id));
    }
}

export type DeleteCastMemberInput = {
    id: string;
};

export type DeleteCastMemberOutput = void;
