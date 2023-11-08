import CastMemberMemoryRepository from "@core/cast-member/infra/repositories/cast-member-memory.repository";
import DeleteCastMemberUseCase from "../delete-cast-member.use-case";
import { CastMemberId } from "@core/cast-member/domain/cast-member-id.value-object";
import CastMember from "@core/cast-member/domain/cast-member.aggregate";
import InvalidUuidException from "@core/shared/domain/errors/uuid-validation.error";
import { CastMemberNotFoundError } from "@core/cast-member/domain/errors/cast-member-not-found.error";

describe("Delete Category UseCase Unit Test", () => {
    let repository: CastMemberMemoryRepository;
    let useCase: DeleteCastMemberUseCase;

    beforeEach(() => {
        repository = new CastMemberMemoryRepository();
        useCase = new DeleteCastMemberUseCase(repository);
    });

    test("Deve lançar InvalidUuidExeception com id fake", async () => {
        await expect(() => useCase.handle({ id: "fake" })).rejects.toThrow(new InvalidUuidException());
    });

    test("Deve lançar EntiityNotFoundExeception pq castMember não foi encontrada.", async () => {
        const uuid = new CastMemberId();
        
        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(new CastMemberNotFoundError(uuid.value));
    });

    test("Deve deletar uma categoria", async () => {
        const spyDelete = jest.spyOn(repository, "delete");
        const castMember = CastMember.fake().aDirector().build();
        repository.insert(castMember);

        await repository.delete(castMember.castMemberId);

        expect(spyDelete).toHaveBeenCalledTimes(1);
        expect(repository.items).toHaveLength(0);
    });
});
