import ValueObject from '@core/shared/domain/value-objects/value-object';
import { CastMemberTypeError } from './errors/cast-member-type.error';
import { Either } from '@core/shared/domain/either';

export enum CastMemberTypeEnum {
    DIRECTOR = 1,
    ACTOR = 2,
}

export default class CastMemberType extends ValueObject {
    constructor(readonly value: CastMemberTypeEnum) {
        super();
        this.validate();
    }

    private validate() {
        const isValid =
            this.value === CastMemberTypeEnum.DIRECTOR ||
            this.value === CastMemberTypeEnum.ACTOR;

        if (!isValid) throw new CastMemberTypeError(this.value);
    }

    static createAnActor() {
        return CastMemberType.create(CastMemberTypeEnum.ACTOR).ok;
    }

    static createADirector() {
        return CastMemberType.create(CastMemberTypeEnum.DIRECTOR).ok;
    }

    static create(
        value: CastMemberTypeEnum,
    ): Either<CastMemberType, CastMemberTypeError> {
        return Either.safe(() => new CastMemberType(value));
    }
}
