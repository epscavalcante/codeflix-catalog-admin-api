import { setupDatabase } from '@core/shared/infra/database/setup-database';
import CastMemberSequelizeRepository from '@core/cast-member/infra/repositories/cast-member-sequelize.repository';
import FindCastMemberUseCase from '../find-cast-member.use-case';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberNotFoundError } from '@core/cast-member/domain/errors/cast-member-not-found.error';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';

describe('Find a CastMember UseCase Unit Test', () => {
    let repository: CastMemberSequelizeRepository;
    let useCase: FindCastMemberUseCase;

    setupDatabase({ models: [CastMemberModel] });

    beforeEach(() => {
        repository = new CastMemberSequelizeRepository(CastMemberModel);
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
            new CastMemberNotFoundError(uuid.value),
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
        expect(output).toStrictEqual({
            id: castMember.castMemberId.value,
            name: castMember.name,
            type: castMember.type.value,
            createdAt: castMember.createdAt,
        });
    });
});
