import { IsInstance, MaxLength, MinLength } from 'class-validator';
import CastMember from './cast-member.aggregate';
import CastMemberType from './cast-member-type.value-object';

export class CastMemberRules {
    @MinLength(3, { groups: ['name'] })
    @MaxLength(255, { groups: ['name'] })
    name: string;

    @IsInstance(CastMemberType, { groups: ['type'] })
    type: CastMemberType;

    constructor(castMember: CastMember) {
        Object.assign(this, castMember);
    }
}
