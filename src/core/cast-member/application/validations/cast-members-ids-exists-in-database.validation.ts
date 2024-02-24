import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import { CastMemberNotFoundError } from '@core/cast-member/domain/errors/cast-member-not-found.error';
import IExistsInDatabaseValidation from '@core/shared/application/validations/exists-in-database.interface';
import { Either } from '@core/shared/domain/either';

export default class CastMembersIdsExistsInDatabaseValidation
    implements IExistsInDatabaseValidation
{
    constructor(private readonly castMemberRepository: ICastMemberRepository) {}

    async validate(
        ids: string[],
    ): Promise<
        Either<CastMemberId[] | null, CastMemberNotFoundError[] | null>
    > {
        const castMembersId = ids.map((id) => new CastMemberId(id));

        const result =
            await this.castMemberRepository.existsByIds(castMembersId);

        return result.notExists.length > 0
            ? Either.fail(
                  result.notExists.map(
                      (item) => new CastMemberNotFoundError(item.value),
                  ),
              )
            : Either.ok(castMembersId);
    }
}
