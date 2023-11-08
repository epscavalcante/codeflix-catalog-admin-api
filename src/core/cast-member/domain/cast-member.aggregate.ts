import ValueObject from '@core/shared/domain/value-objects/value-object';
import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import CastMemberType from './cast-member-type.value-object';
import { CastMemberId } from './cast-member-id.value-object';
import CastMemberFactory from './cast-member.factory';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { CastMemberValidatorFactory } from './cast-member.validator';

export default class CastMember extends AggregateRoot {
    castMemberId: CastMemberId;
    name: string;
    type: CastMemberType;
    createdAt: Date;

    constructor(props: CastMemberProps) {
        super();
        this.castMemberId = props.castMemberId ?? new CastMemberId();
        this.name = props.name;
        this.type = props.type;
        this.createdAt = props.createdAt ?? new Date();
    }

    static create(props: CastMemberCreateCommand): CastMember {
        const castMember = new CastMember(props);

        castMember.validate(['name', 'type']);

        return castMember;
    }

    validate(fields?: string[]) {
        const castMemberValidator = CastMemberValidatorFactory.create();

        return castMemberValidator.validate(this.notification, this, fields);
    }

    static fake() {
        return CastMemberFactory;
    }

    changeName(name: string): void {
        this.name = name;

        this.validate(['name']);
    }

    changeType(type: CastMemberType): void {
        this.type = type;

        this.validate(['type']);
    }

    toJSON() {
        return {
            castMemberId: this.castMemberId.value,
            name: this.name,
            type: this.type.value,
            createdAt: this.createdAt,
        };
    }

    get entityId(): ValueObject {
        return this.castMemberId;
    }
}

export type CastMemberProps = {
    castMemberId?: CategoryId;
    name: string;
    type: CastMemberType;
    createdAt?: Date;
};

export type CastMemberCreateCommand = {
    name: string;
    type: CastMemberType;
};
