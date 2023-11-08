import CreateCastMemberUseCase from '../create-cast-member-use-case';
import { CreateCastMemberInput } from '../mappers/create-cast-member.use-case.input';
import { CastMemberTypeEnum } from '@core/cast-member/domain/cast-member-type.value-object';
import CastMemberSequelizeRepository from '@core/cast-member/infra/repositories/cast-member-sequelize.repository';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';

describe('CreateCastMemberUseCase Unit Tests', () => {
    let useCase: CreateCastMemberUseCase;
    let repository: CastMemberSequelizeRepository;

    setupDatabase({ models: [CastMemberModel] });

    beforeEach(() => {
        repository = new CastMemberSequelizeRepository(CastMemberModel);
        useCase = new CreateCastMemberUseCase(repository);
        jest.restoreAllMocks();
    });

    describe('handle method', () => {
        it('should throw an generic error', async () => {
            const expectedError = new Error('generic error');
            jest.spyOn(repository, 'insert').mockRejectedValue(expectedError);
            await expect(
                useCase.handle({
                    name: 'test',
                    type: CastMemberTypeEnum.ACTOR,
                }),
            ).rejects.toThrowError(expectedError);
        });

        it('should throw an entity validation error', async () => {
            try {
                await useCase.handle(
                    new CreateCastMemberInput({
                        name: 'cast',
                        type: 'a' as any,
                    }),
                );
            } catch (e) {
                expect(e).toBeInstanceOf(EntityValidationError);
                expect(e.error).toStrictEqual([
                    {
                        type: ['Invalid cast member type: a'],
                    },
                ]);
            }
            expect.assertions(2);
        });

        it('should create a cast member actor', async () => {
            const spyInsert = jest.spyOn(repository, 'insert');
            const output = await useCase.handle({
                name: 'test',
                type: CastMemberTypeEnum.ACTOR,
            });
            
            const entity = await repository.findById(new CastMemberId(output.id));
            
            expect(spyInsert).toHaveBeenCalledTimes(1);
            expect(output).toStrictEqual({
                id: entity!.castMemberId.value,
                name: 'test',
                type: CastMemberTypeEnum.ACTOR,
                createdAt: entity!.createdAt,
            });

        });

        it('should create a cast member director', async () => {
            const spyInsert = jest.spyOn(repository, 'insert');
            const output = await useCase.handle({
                name: 'test',
                type: CastMemberTypeEnum.DIRECTOR,
            });
            
            const entity = await repository.findById(new CastMemberId(output.id));
            
            expect(spyInsert).toHaveBeenCalledTimes(1);
            expect(output).toStrictEqual({
                id: entity!.castMemberId.value,
                name: 'test',
                type: CastMemberTypeEnum.DIRECTOR,
                createdAt: entity!.createdAt,
            });
        });
    });
});
