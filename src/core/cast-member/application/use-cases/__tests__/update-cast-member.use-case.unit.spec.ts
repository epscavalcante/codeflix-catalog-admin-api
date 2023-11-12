import CastMemberMemoryRepository from '@core/cast-member/infra/repositories/cast-member-memory.repository';
import UpdateCastMemberUseCase from '../update-cast-member.use-case';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import { CastMemberNotFoundError } from '@core/cast-member/domain/errors/cast-member-not-found.error';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberTypeEnum } from '@core/cast-member/domain/cast-member-type.value-object';
import { UpdateCastMemberInput } from '../mappers/update-cast-member-use-case.input';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';

describe('Update CastMember UseCase UnitTest', () => {
    let repository: CastMemberMemoryRepository;
    let useCase: UpdateCastMemberUseCase;

    beforeEach(() => {
        repository = new CastMemberMemoryRepository();
        useCase = new UpdateCastMemberUseCase(repository);
    });

    test('Deve lançar exceção de id inválido', async () => {
        const input = {
            id: 'fake',
        } as UpdateCastMemberInput;

        await expect(() => useCase.handle(input)).rejects.toThrow(
            new InvalidUuidException(),
        );
    });

    test('Deve lançar exceção de castMember não encontrada', async () => {
        const castMemberId = new CastMemberId();

        await expect(() =>
            useCase.handle({ id: castMemberId.value, name: 'test', type: 1 }),
        ).rejects.toThrow(new CastMemberNotFoundError(castMemberId.value));
    });

    test('Deve lançar exception EntityValidationError', async () => {
        const castMember = CastMember.fake().aDirector().build();
        repository.items = [castMember];
        const input = {
            id: castMember.castMemberId.value,
            name: 'T'.repeat(256),
            type: castMember.type.value,
        };

        expect(() => useCase.handle(input)).rejects.toThrowError(
            'Entity Validation Error',
        );
    });

    test('Deve alterar o nome da castMember', async () => {
        const spyUpdate = jest.spyOn(repository, 'update');
        const castMember = CastMember.fake().aDirector().build();
        repository.items.push(castMember);

        const output = await useCase.handle({
            id: castMember.castMemberId.value,
            name: 'Changed',
            type: castMember.type.value,
        });

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: castMember.castMemberId.value,
            name: 'Changed',
            type: castMember.type.value,
            createdAt: repository.items[0].createdAt,
        });
    });

    test('Deve alterar a tipo do castMember', async () => {
        const spyUpdate = jest.spyOn(repository, 'update');
        const castMember = CastMember.fake().aDirector().build();
        repository.items.push(castMember);

        const output = await useCase.handle({
            id: castMember.castMemberId.value,
            name: castMember.name,
            type: CastMemberTypeEnum.ACTOR,
        });

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: castMember.castMemberId.value,
            name: castMember.name,
            type: CastMemberTypeEnum.ACTOR,
            createdAt: repository.items[0].createdAt,
        });
    });
});
