import { Chance } from 'chance';
import CastMemberFactory from '../cast-member.factory';
import Uuid from '../../../shared/domain/value-objects/uuid.vo';
import { CastMemberId } from '../cast-member-id.value-object';
import CastMemberType, {
    CastMemberTypeEnum,
} from '../cast-member-type.value-object';

describe('CategoryFakerBuilder Unit Tests', () => {
    describe('castMemberId prop', () => {
        const faker = CastMemberFactory.anActor();

        test('should throw error when any with methods has called', () => {
            expect(() => faker.castMemberId).toThrowError(
                new Error(
                    "Property castMemberId not have a factory, use 'with' methods",
                ),
            );
        });

        test('should be undefined', () => {
            expect(faker['_castMemberId']).toBeUndefined();
        });

        test('withCastMemberId', () => {
            const castMemberId = new CastMemberId();
            const $this = faker.withCastMemberId(castMemberId);
            expect($this).toBeInstanceOf(CastMemberFactory);
            expect(faker['_castMemberId']).toBe(castMemberId);

            faker.withCastMemberId(() => castMemberId);
            //@ts-expect-error _castMemberId is a callable
            expect(faker['_castMemberId']()).toBe(castMemberId);

            expect(faker.castMemberId).toBe(castMemberId);
        });

        test('should pass index to castMemberId factory', () => {
            let mockFactory = jest.fn(() => new Uuid());
            faker.withCastMemberId(mockFactory);
            faker.build();
            expect(mockFactory).toHaveBeenCalledTimes(1);

            const castMemberId = new Uuid();
            mockFactory = jest.fn(() => castMemberId);
            const fakerMany = CastMemberFactory.theCastMembers(2);
            fakerMany.withCastMemberId(mockFactory);
            fakerMany.build();

            expect(mockFactory).toHaveBeenCalledTimes(2);
            expect(fakerMany.build()[0].castMemberId).toBe(castMemberId);
            expect(fakerMany.build()[1].castMemberId).toBe(castMemberId);
        });
    });

    describe('name prop', () => {
        const faker = CastMemberFactory.anActor();
        test('should be a function', () => {
            expect(typeof faker['_name']).toBe('function');
        });

        test('should call the word method', () => {
            const chance = Chance();
            const spyWordMethod = jest.spyOn(chance, 'word');
            faker['chance'] = chance;
            faker.build();

            expect(spyWordMethod).toHaveBeenCalled();
        });

        test('withName', () => {
            const $this = faker.withName('test name');
            expect($this).toBeInstanceOf(CastMemberFactory);
            expect(faker['_name']).toBe('test name');

            faker.withName(() => 'test name');
            //@ts-expect-error name is callable
            expect(faker['_name']()).toBe('test name');

            expect(faker.name).toBe('test name');
        });

        test('should pass index to name factory', () => {
            faker.withName((index) => `test name ${index}`);
            const castMember = faker.build();
            expect(castMember.name).toBe(`test name 0`);

            const fakerMany = CastMemberFactory.theCastMembers(2);
            fakerMany.withName((index) => `test name ${index}`);
            const castMembers = fakerMany.build();

            expect(castMembers[0].name).toBe(`test name 0`);
            expect(castMembers[1].name).toBe(`test name 1`);
        });

        test('invalid too long case', () => {
            const $this = faker.withInvalidNameTooLong();
            expect($this).toBeInstanceOf(CastMemberFactory);
            expect(faker['_name'].length).toBe(256);

            const tooLong = 'a'.repeat(256);
            faker.withInvalidNameTooLong(tooLong);
            expect(faker['_name'].length).toBe(256);
            expect(faker['_name']).toBe(tooLong);
        });
    });

    describe('type prop', () => {
        const faker = CastMemberFactory.anActor();
        it('should be a CastMemberType', () => {
            expect(faker['_type']).toBeInstanceOf(CastMemberType);
        });

        test('withType', () => {
            const director = new CastMemberType(CastMemberTypeEnum.DIRECTOR);
            const $this = faker.withType(director);
            expect($this).toBeInstanceOf(CastMemberFactory);
            expect(faker.type).toBe(director);
            expect(faker.type.value).toBe(director.value);

            const actor = new CastMemberType(CastMemberTypeEnum.DIRECTOR);
            faker.withType(actor);
            expect(faker['_type']).toEqual(actor);
            expect(faker.type).toEqual(actor);
        });
    });

    describe('createdAt prop', () => {
        const faker = CastMemberFactory.anActor();

        test('should throw error when any with methods has called', () => {
            const fakerCategory = CastMemberFactory.anActor();
            expect(() => fakerCategory.createdAt).toThrowError(
                new Error(
                    "Property createdAt not have a factory, use 'with' methods",
                ),
            );
        });

        test('should be undefined', () => {
            expect(faker['_createdAt']).toBeUndefined();
        });

        test('withCreatedAt', () => {
            const date = new Date();
            const $this = faker.withCreatedAt(date);
            expect($this).toBeInstanceOf(CastMemberFactory);
            expect(faker['_createdAt']).toBe(date);

            faker.withCreatedAt(() => date);
            //@ts-expect-error _createdAt is a callable
            expect(faker['_createdAt']()).toBe(date);
            expect(faker.createdAt).toBe(date);
        });

        test('should pass index to createdAt factory', () => {
            const date = new Date();
            faker.withCreatedAt(
                (index) => new Date(date.getTime() + index + 2),
            );
            const castMember = faker.build();
            expect(castMember.createdAt.getTime()).toBe(date.getTime() + 2);

            const fakerMany = CastMemberFactory.theCastMembers(2);
            fakerMany.withCreatedAt(
                (index) => new Date(date.getTime() + index + 2),
            );
            const castMembers = fakerMany.build();

            expect(castMembers[0].createdAt.getTime()).toBe(date.getTime() + 2);
            expect(castMembers[1].createdAt.getTime()).toBe(date.getTime() + 3);
        });
    });

    test('should create a castMember actor', () => {
        const fakerActor = CastMemberFactory.anActor();
        const castMember = fakerActor.build();

        expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
        expect(typeof castMember.name === 'string').toBeTruthy();
        expect(castMember.createdAt).toBeInstanceOf(Date);

        const createdAt = new Date();
        const castMemberId = new CastMemberId();
        const castMemberActor = fakerActor
            .withCastMemberId(castMemberId)
            .withName('name test')
            .withType(new CastMemberType(CastMemberTypeEnum.ACTOR))
            .withCreatedAt(createdAt)
            .build();

        expect(castMemberActor.castMemberId.value).toBe(castMemberId.value);
        expect(castMemberActor.name).toBe('name test');
        expect(castMemberActor.type).toBeInstanceOf(CastMemberType);
        expect(castMemberActor.type.value).toBe(CastMemberTypeEnum.ACTOR);
        expect(castMemberActor.createdAt).toBe(createdAt);
    });

    test('should create a castMember director', () => {
        const fakerActor = CastMemberFactory.aDirector();
        const castMember = fakerActor.build();

        expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
        expect(typeof castMember.name === 'string').toBeTruthy();
        expect(castMember.type).toBeInstanceOf(CastMemberType);
        expect(castMember.createdAt).toBeInstanceOf(Date);
        expect(castMember.type.value).toBe(CastMemberTypeEnum.DIRECTOR);

        const createdAt = new Date();
        const castMemberId = new CastMemberId();
        const castMemberActor = fakerActor
            .withCastMemberId(castMemberId)
            .withName('name test')
            .withType(new CastMemberType(CastMemberTypeEnum.DIRECTOR))
            .withCreatedAt(createdAt)
            .build();

        expect(castMemberActor.castMemberId.value).toBe(castMemberId.value);
        expect(castMemberActor.name).toBe('name test');
        expect(castMemberActor.type.value).toBe(CastMemberTypeEnum.DIRECTOR);
        expect(castMemberActor.createdAt).toBe(createdAt);
    });

    test('should create many castMembers', () => {
        const faker = CastMemberFactory.theCastMembers(2);
        let castMembers = faker.build();

        castMembers.forEach((castMember) => {
            expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
            expect(castMember.type).toBeInstanceOf(CastMemberType);
            expect(castMember.createdAt).toBeInstanceOf(Date);
            expect(typeof castMember.name === 'string').toBeTruthy();
        });

        const createdAt = new Date();
        const castMemberId = new CastMemberId();
        castMembers = faker
            .withCastMemberId(castMemberId)
            .withName('name test')
            .withType(new CastMemberType(CastMemberTypeEnum.ACTOR))
            .withCreatedAt(createdAt)
            .build();

        castMembers.forEach((castMember) => {
            expect(castMember.castMemberId.value).toBe(castMemberId.value);
            expect(castMember.name).toBe('name test');
            expect(castMember.type.value).toBe(CastMemberTypeEnum.ACTOR);
            expect(castMember.createdAt).toBe(createdAt);
        });
    });
});
