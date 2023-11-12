import { setupDatabase } from '@core/shared/infra/database/setup-database';
import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import CastMemberSequelizeRepository from '@core/cast-member/infra/repositories/cast-member-sequelize.repository';
import DeleteCastMemberUseCase from '../delete-cast-member.use-case';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';

describe('Delete CastMember UseCase Integration Test', () => {
    let repository: CastMemberSequelizeRepository;
    let useCase: DeleteCastMemberUseCase;

    setupDatabase({ models: [CastMemberModel] });

    beforeEach(() => {
        repository = new CastMemberSequelizeRepository(CastMemberModel);
        useCase = new DeleteCastMemberUseCase(repository);
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

    test('Deve deletar uma categoria', async () => {
        const spyDelete = jest.spyOn(repository, 'delete');
        const castMember = CastMember.fake().aDirector().build();
        await repository.insert(castMember);

        await repository.delete(castMember.castMemberId);

        const castMemberFounded = await repository.findById(
            castMember.castMemberId,
        );

        expect(spyDelete).toHaveBeenCalledTimes(1);
        expect(castMemberFounded).toBeNull();
    });
});
