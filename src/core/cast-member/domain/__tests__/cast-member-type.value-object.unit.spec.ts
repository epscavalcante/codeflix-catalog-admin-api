import CastMemberType, {
    CastMemberTypeEnum,
} from '../cast-member-type.value-object';
import { CastMemberTypeError } from '../errors/cast-member-type.error';

describe('CastMemberType Unit Tests', () => {
    test('should return error when type is invalid', () => {
        const validateSpy = jest.spyOn(
            CastMemberType.prototype,
            'validate' as any,
        );
        const [castMember, error] = CastMemberType.create('1' as any);
        expect(castMember).toBeNull();
        expect(error).toEqual(new CastMemberTypeError('1'));
        expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    test('should create a director', () => {
        const [castMemberType1, error1] = CastMemberType.create(
            CastMemberTypeEnum.DIRECTOR,
        ).asArray();
        expect(error1).toBeNull();
        expect(castMemberType1).toBeInstanceOf(CastMemberType);
        expect(castMemberType1.value).toBe(CastMemberTypeEnum.DIRECTOR);

        const castMemberType2 = CastMemberType.createADirector();
        expect(castMemberType2).toBeInstanceOf(CastMemberType);
        expect(castMemberType2.value).toBe(CastMemberTypeEnum.DIRECTOR);
    });

    test('should create an actor', () => {
        const [castMember, error] = CastMemberType.create(
            CastMemberTypeEnum.ACTOR,
        ).asArray();
        expect(error).toBeNull();
        expect(castMember).toBeInstanceOf(CastMemberType);
        expect(castMember.value).toBe(CastMemberTypeEnum.ACTOR);

        const castMember2 = CastMemberType.createAnActor();
        expect(castMember2).toBeInstanceOf(CastMemberType);
        expect(castMember2.value).toBe(CastMemberTypeEnum.ACTOR);
    });
});
