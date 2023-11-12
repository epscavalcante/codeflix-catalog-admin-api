import {
    CastMemberOutput,
    CastMemberOutputType,
} from './mappers/create-cast-member.use-case.output';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import { CreateCastMemberInput } from './mappers/create-cast-member.use-case.input';
import CastMemberType from '@core/cast-member/domain/cast-member-type.value-object';
import CastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';

export default class CreateCastMemberUseCase
    implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput>
{
    constructor(private castMemberRepo: CastMemberRepository) {}

    async handle(input: CreateCastMemberInput): Promise<CastMemberOutputType> {
        const [type, errorCastMemberType] = CastMemberType.create(
            input.type,
        ).asArray();
        const entity = CastMember.create({
            ...input,
            type,
        });
        const notification = entity.notification;
        if (errorCastMemberType) {
            notification.setError(errorCastMemberType.message, 'type');
        }

        if (notification.hasErrors()) {
            throw new EntityValidationError(notification.toJSON());
        }

        await this.castMemberRepo.insert(entity);

        return CastMemberOutput.toOutput(entity);
    }
}

export type CreateCastMemberOutput = CastMemberOutputType;
