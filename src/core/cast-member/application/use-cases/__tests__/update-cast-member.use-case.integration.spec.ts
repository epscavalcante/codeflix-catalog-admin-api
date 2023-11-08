import UpdateCastMemberUseCase from '../update-cast-member.use-case';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import { CastMemberNotFoundError } from '@core/cast-member/domain/errors/cast-member-not-found.error';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberTypeEnum } from '@core/cast-member/domain/cast-member-type.value-object';
import CastMemberSequelizeRepository from '@core/cast-member/infra/repositories/cast-member-sequelize.repository';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';

describe('Update CastMember UseCase Integration tests', () => {
    let repository: CastMemberSequelizeRepository;
    let useCase: UpdateCastMemberUseCase;

    setupDatabase({
        models: [CastMemberModel],
    });

    beforeEach(() => {
        repository = new CastMemberSequelizeRepository(CastMemberModel);
        useCase = new UpdateCastMemberUseCase(repository);
    });

    test('Deve lançar exceção de castMember não encontrada', async () => {
        const castMemberId = new CastMemberId();

        await expect(() =>
            useCase.handle({ id: castMemberId.value, name: 'test', type: 1 }),
        ).rejects.toThrow(new CastMemberNotFoundError(castMemberId.value));
    });

    test.skip('Deve lançar exception EntityValidationError', async () => {
        const castMember = CastMember.fake().aDirector().build();
        await repository.insert(castMember);
        const input = {
            id: castMember.castMemberId.value,
            name: 'TTT'.repeat(300),
            type: castMember.type.value,
        };
        
        expect(() => useCase.handle(input)).rejects.toThrowError(
            'Entity Validation Error',
        );
    });

    test('Deve alterar o nome da castMember', async () => {
        const spyUpdate = jest.spyOn(repository, 'update');
        const castMember = CastMember.fake().aDirector().build();
        await repository.insert(castMember);

        const output = await useCase.handle({
            id: castMember.castMemberId.value,
            name: 'Changed',
            type: castMember.type.value,
        });

        const castMemberUpdated = await repository.findById(
            castMember.castMemberId,
        );

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: castMemberUpdated!.castMemberId.value,
            name: 'Changed',
            type: castMemberUpdated?.type.value,
            createdAt: castMemberUpdated!.createdAt,
        });
    });

    test('Deve alterar a tipo do castMember', async () => {
        const spyUpdate = jest.spyOn(repository, 'update');
        const castMember = CastMember.fake().aDirector().build();
        await repository.insert(castMember);

        const output = await useCase.handle({
            id: castMember.castMemberId.value,
            name: castMember.name,
            type: CastMemberTypeEnum.ACTOR,
        });

        const castMemberUpdated = await repository.findById(
            castMember.castMemberId,
        );

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: castMemberUpdated!.castMemberId.value,
            name: castMemberUpdated!.name,
            type: CastMemberTypeEnum.ACTOR,
            createdAt: castMemberUpdated!.createdAt,
        });
    });
});
