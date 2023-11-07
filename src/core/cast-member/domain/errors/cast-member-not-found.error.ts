import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';
import CastMember from '../cast-member.aggregate';

export class CastMemberNotFoundError extends EntityNotFoundError {
    constructor(id: string) {
        super(id, CastMember);
    }
}
