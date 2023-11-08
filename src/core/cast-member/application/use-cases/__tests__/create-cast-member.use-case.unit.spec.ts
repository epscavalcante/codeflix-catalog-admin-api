import CastMemberMemoryRepository from "@core/cast-member/infra/repositories/cast-member-memory.repository";
import CreateCastMemberUseCase from "../create-cast-member-use-case";
import { CreateCastMemberInput } from "../mappers/create-cast-member.use-case.input";
import { CastMemberTypeEnum } from "@core/cast-member/domain/cast-member-type.value-object";
import EntityValidationError from "@core/shared/domain/errors/entity-validation.error";

describe('CreateCastMemberUseCase Unit Tests', () => {
    let useCase: CreateCastMemberUseCase;
    let repository: CastMemberMemoryRepository;

    beforeEach(() => {
        repository = new CastMemberMemoryRepository();
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

        it('should create a cast member', async () => {
            const spyInsert = jest.spyOn(repository, 'insert');
            let output = await useCase.handle({
                name: 'test',
                type: CastMemberTypeEnum.ACTOR,
            });
            expect(spyInsert).toHaveBeenCalledTimes(1);
            expect(output).toStrictEqual({
                id: repository.items[0].castMemberId.value,
                name: 'test',
                type: CastMemberTypeEnum.ACTOR,
                createdAt: repository.items[0].createdAt,
            });

            output = await useCase.handle({
                name: 'test',
                type: CastMemberTypeEnum.DIRECTOR,
            });
            expect(spyInsert).toHaveBeenCalledTimes(2);
            expect(output).toStrictEqual({
                id: repository.items[1].castMemberId.value,
                name: 'test',
                type: CastMemberTypeEnum.DIRECTOR,
                createdAt: repository.items[1].createdAt,
            });
        });
    });
});
