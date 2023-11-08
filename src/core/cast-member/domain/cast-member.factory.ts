import { Chance } from 'chance';
import CastMember from './cast-member.aggregate';
import CastMemberType, {
    CastMemberTypeEnum,
} from './cast-member-type.value-object';
import { CastMemberId } from './cast-member-id.value-object';

type PropOrFactory<T> = T | ((index: number) => T);

export default class CastMemberFactory<TBuild = any> {
    // auto generated in entity
    private _castMemberId: PropOrFactory<CastMemberId> | undefined = undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _name: PropOrFactory<string> = (_index) =>
        this.chance.word({ length: 5 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // @ts-ignore
    private _type: PropOrFactory<CastMemberType> = (_index) =>
        new CastMemberType(
            // @ts-ignore
            [CastMemberTypeEnum.ACTOR, CastMemberTypeEnum.DIRECTOR].random(),
        );
    // auto generated in entity
    private _createdAt: PropOrFactory<Date> | undefined = undefined;

    private countObjs;

    private chance: Chance.Chance;

    private constructor(countObjs: number = 1) {
        this.countObjs = countObjs;
        this.chance = Chance();
    }

    static theCastMembers(count: number) {
        return new CastMemberFactory<CastMember[]>(count);
    }

    static anActor() {
        return new CastMemberFactory<CastMember>().withType(
            new CastMemberType(CastMemberTypeEnum.ACTOR),
        );
    }

    static aDirector() {
        return new CastMemberFactory<CastMember>().withType(
            new CastMemberType(CastMemberTypeEnum.DIRECTOR),
        );
    }

    static theDirectors(countObjs: number) {
        return new CastMemberFactory<CastMember[]>(countObjs).withType(
            new CastMemberType(CastMemberTypeEnum.DIRECTOR),
        );
    }

    static theActors(countObjs: number) {
        return new CastMemberFactory<CastMember[]>(countObjs).withType(
            new CastMemberType(CastMemberTypeEnum.ACTOR),
        );
    }

    withCastMemberId(valueOrFactory: PropOrFactory<CastMemberId>) {
        this._castMemberId = valueOrFactory;
        return this;
    }

    withName(valueOrFactory: PropOrFactory<string>) {
        this._name = valueOrFactory;
        return this;
    }

    withType(valueOrFactory: PropOrFactory<CastMemberType>) {
        this._type = valueOrFactory;
        return this;
    }

    withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
        this._createdAt = valueOrFactory;
        return this;
    }

    withInvalidNameTooLong(value?: string) {
        this._name = value ?? this.chance.word({ length: 256 });
        return this;
    }

    build(): TBuild {
        const castMembers = new Array(this.countObjs)
            .fill(undefined)
            .map((_, index) => {
                const castMember = new CastMember({
                    castMemberId: !this._castMemberId
                        ? undefined
                        : this.callFactory(this._castMemberId, index),
                    name: this.callFactory(this._name, index),
                    type: this.callFactory(this._type, index),
                    ...(this._createdAt && {
                        createdAt: this.callFactory(this._createdAt, index),
                    }),
                });

                castMember.validate();

                return castMember;
            });
        return this.countObjs === 1 ? (castMembers[0] as any) : castMembers;
    }

    get castMemberId() {
        return this.getValue('castMemberId');
    }

    get name() {
        return this.getValue('name');
    }

    get type() {
        return this.getValue('type');
    }

    get createdAt() {
        return this.getValue('createdAt');
    }

    private getValue(prop: any) {
        const optional = ['castMemberId', 'createdAt'];
        const privateProp = `_${prop}` as keyof this;
        if (!this[privateProp] && optional.includes(prop)) {
            throw new Error(
                `Property ${prop} not have a factory, use 'with' methods`,
            );
        }
        return this.callFactory(this[privateProp], 0);
    }

    private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
        return typeof factoryOrValue === 'function'
            ? factoryOrValue(index)
            : factoryOrValue;
    }
}

// @ts-ignore
Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};
