import { Validator } from '@core/shared/domain/validator';
import CastMember from './cast-member.aggregate';
import { CastMemberRules } from './cast-member.rules';
import Notification from '@core/shared/domain/notification';

export class CastMemberValidator extends Validator {
    validate(
        notification: Notification,
        data: CastMember,
        fields?: string[],
    ): boolean {
        const newFields = fields?.length ? fields : ['name', 'type'];
        return super.validate(
            notification,
            new CastMemberRules(data),
            newFields,
        );
    }
}

export class CastMemberValidatorFactory {
    static create() {
        return new CastMemberValidator();
    }
}
