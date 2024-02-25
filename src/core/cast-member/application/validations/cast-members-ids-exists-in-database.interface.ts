import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import { CastMemberNotFoundError } from '@core/cast-member/domain/errors/cast-member-not-found.error';
import IExistsInDatabaseValidation from '@core/shared/application/validations/exists-in-database.interface';

export default interface ICastMemberIdsExistsInDatabaseValidation
    extends IExistsInDatabaseValidation<
        CastMemberId,
        CastMemberNotFoundError
    > {}
