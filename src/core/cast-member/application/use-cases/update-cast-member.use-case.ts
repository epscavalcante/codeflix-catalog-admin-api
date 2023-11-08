import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import { UpdateCastMemberInput } from './mappers/update-cast-member-use-case.input';
import CastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import { CastMemberNotFoundError } from '@core/cast-member/domain/errors/cast-member-not-found.error';
import CastMemberType from '@core/cast-member/domain/cast-member-type.value-object';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import CastMemberOutputMapper, { CastMemberOutputType } from './mappers/cast-member-output.mapper';

export default class UpdateCastMemberUseCase
    implements IUseCase<UpdateCastMemberInput, UpdateCastMemberOutput>
{
    constructor(private readonly repository: CastMemberRepository) {}

    async handle(
        input: UpdateCastMemberInput,
    ): Promise<UpdateCastMemberOutput> {
        const castMember = await this.repository.findById(
            new CastMemberId(input.id),
        );

        if (!castMember) throw new CastMemberNotFoundError(input.id);

        input.name && castMember.changeName(input.name);

        if (input.type) {
            const [castMemberType, castMemberTypeError] = CastMemberType.create(
                input.type,
            ).asArray();

            castMember.changeType(castMemberType);

            if (castMemberTypeError) {
                castMember.notification.setError(
                    castMemberTypeError.message,
                    'type',
                );
            }
        }

        if (castMember.notification.hasErrors()) {
            throw new EntityValidationError(castMember.notification.toJSON());
        }

        await this.repository.update(castMember);

        return CastMemberOutputMapper.toOutput(castMember);
    }
}

export type UpdateCastMemberOutput = CastMemberOutputType;
