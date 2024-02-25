import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import { CastMemberNotFoundError } from '@core/cast-member/domain/errors/cast-member-not-found.error';
import { Either } from '@core/shared/domain/either';
import ICastMemberIdsExistsInDatabaseValidation from './cast-members-ids-exists-in-database.interface';

export default class CastMembersIdsExistsInDatabaseValidation
    implements ICastMemberIdsExistsInDatabaseValidation
{
    constructor(private readonly castMemberRepository: ICastMemberRepository) {}

    async validate(ids: string[]) {
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
