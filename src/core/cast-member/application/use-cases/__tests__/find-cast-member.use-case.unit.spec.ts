import CastMemberMemoryRepository from '@core/cast-member/infra/repositories/cast-member-memory.repository';
import FindCastMemberUseCase from '../find-cast-member.use-case';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';

describe('Find a CastMember UseCase Unit Test', () => {
    let repository: CastMemberMemoryRepository;
    let useCase: FindCastMemberUseCase;

    beforeEach(() => {
        repository = new CastMemberMemoryRepository();
        useCase = new FindCastMemberUseCase(repository);
    });

    test('Deve lançar InvalidUuidExeception com id fake', async () => {
        await expect(() => useCase.handle({ id: 'fake' })).rejects.toThrow(
            new InvalidUuidException(),
        );
    });

    test('Deve lançar EntiityNotFoundExeception pq categoria não foi encontrada.', async () => {
        const uuid = new CastMemberId();

        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(
            new EntityNotFoundError(uuid.value, CastMember),
        );
    });

    test('Deve retornar uma categoria', async () => {
        const spyFindById = jest.spyOn(repository, 'findById');
        const castMember = CastMember.fake().aDirector().build();
        repository.insert(castMember);

        const output = await useCase.handle({
            id: castMember.castMemberId.value,
        });

        expect(spyFindById).toHaveBeenCalledTimes(1);
        expect(repository.items).toHaveLength(1);
        expect(output).toStrictEqual({
            id: castMember.castMemberId.value,
            name: castMember.name,
            type: castMember.type.value,
            createdAt: castMember.createdAt,
        });
    });
});
