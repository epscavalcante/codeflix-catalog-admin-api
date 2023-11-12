import Uuid from '../../../shared/domain/value-objects/uuid.vo';
import CastMemberType, {
    CastMemberTypeEnum,
} from '../cast-member-type.value-object';
import CastMember, {
    CastMemberCreateCommand,
    CastMemberProps,
} from '../cast-member.aggregate';

describe('CastMember Unit Test', () => {
    let castMemberValidationSpy: any;

    describe('Without validation entity', () => {
        beforeEach(() => {
            castMemberValidationSpy = CastMember.prototype.validate = jest
                .fn()
                .mockImplementation(CastMember.prototype.validate);
        });

        test('deve alterar o nome de um ator', () => {
            const input: CastMemberProps = {
                name: 'Test',
                type: new CastMemberType(CastMemberTypeEnum.ACTOR),
            };

            const castMember = new CastMember(input);

            castMember.changeName('New name');

            expect(castMember.name).toBe('New name');
            expect(castMemberValidationSpy).toBeCalledTimes(1);
        });

        test('deve alterar a o tipo', () => {
            const input: CastMemberProps = {
                name: 'Test',
                type: new CastMemberType(CastMemberTypeEnum.ACTOR),
            };

            const castMember = new CastMember(input);

            castMember.changeType(
                new CastMemberType(CastMemberTypeEnum.DIRECTOR),
            );

            expect(castMember.type).toBeInstanceOf(CastMemberType);
            expect(castMember.type.value).toBe(CastMemberTypeEnum.DIRECTOR);
            expect(castMemberValidationSpy).toBeCalledTimes(1);
        });
    });

    describe('Static command create', () => {
        test('deve criar um castMember actor', () => {
            const input: CastMemberCreateCommand = {
                name: 'Test',
                type: new CastMemberType(CastMemberTypeEnum.ACTOR),
            };

            const castMember = CastMember.create(input);

            expect(castMember.castMemberId).toBeDefined();
            expect(castMember.castMemberId).toBeInstanceOf(Uuid);
            expect(castMember.name).toBe('Test');
            expect(castMember.type).toBeInstanceOf(CastMemberType);
            expect(castMember.type.value).toBe(CastMemberTypeEnum.ACTOR);
            expect(castMember.createdAt).not.toBeNull();
            expect(castMember.createdAt).toBeInstanceOf(Date);
            expect(CastMember.prototype.validate).toBeCalledTimes(1);
            expect(castMember.notification.hasErrors()).toBeFalsy();
        });

        test('deve criar um castMember diretor', () => {
            const input: CastMemberCreateCommand = {
                name: 'Test',
                type: new CastMemberType(CastMemberTypeEnum.DIRECTOR),
            };

            const castMember = CastMember.create(input);

            expect(castMember.castMemberId).toBeDefined();
            expect(castMember.castMemberId).toBeInstanceOf(Uuid);
            expect(castMember.name).toBe('Test');
            expect(castMember.type).toBeInstanceOf(CastMemberType);
            expect(castMember.type.value).toBe(CastMemberTypeEnum.DIRECTOR);
            expect(castMember.createdAt).not.toBeNull();
            expect(castMember.createdAt).toBeInstanceOf(Date);
            expect(CastMember.prototype.validate).toBeCalledTimes(1);
            expect(castMember.notification.hasErrors()).toBeFalsy();
        });
    });

    describe('Testes de invalidação na categoria', () => {
        describe('Invalidação do name e tipo', () => {
            test('Deve invalidar criação da categoria sem nome e sem tipo', () => {
                const input: CastMemberCreateCommand = {
                    // @ts-ignore
                    name: null,
                    // @ts-ignore
                    type: null,
                };

                const castMember = CastMember.create(input);

                expect(castMember.notification.hasErrors()).toBeTruthy();
                expect(
                    castMember.notification,
                ).notificationContainsErrorMessages([
                    {
                        name: [
                            'name must be shorter than or equal to 255 characters',
                            'name must be longer than or equal to 3 characters',
                        ],
                        // type: [
                        //     "type must be one of the following values: 2, 1"
                        // ]
                    },
                ]);
            });

            test('Deve invalidar criação da categoria com nome vazio', () => {
                const input: CastMemberCreateCommand = {
                    // @ts-ignore
                    name: '',
                    // @ts-ignore
                    type: '',
                };

                const castMember = CastMember.create(input);

                expect(castMember.notification.hasErrors()).toBeTruthy();
                expect(
                    castMember.notification,
                ).notificationContainsErrorMessages([
                    {
                        name: [
                            'name must be shorter than or equal to 255 characters',
                            'name must be longer than or equal to 3 characters',
                        ],
                    },
                ]);
            });

            test('Deve invalidar criação da categoria com nome maior que 255 caracteres', () => {
                const input: CastMemberCreateCommand = {
                    name: 'a'.repeat(256),
                    // @ts-ignore
                    type: null,
                };

                const castMember = CastMember.create(input);

                expect(castMember.notification.hasErrors()).toBeTruthy();
                expect(
                    castMember.notification,
                ).notificationContainsErrorMessages([
                    {
                        name: [
                            'name must be shorter than or equal to 255 characters',
                        ],
                    },
                ]);
            });
        });
    });
});
