import Uuid from "../../../../domain/value-objects/uuid.vo";
import InvalidUuidException from "../../../../domain/exceptions/invalid-uuid.exception";
import CategoryMemoryRepository from "../../../../infra/repositories/category-memory.repository";
import DeleteCategoryUseCase from "../delete-category.use-case";
import EntityNotFoundException from "../../../../domain/exceptions/entity-not-found.exception";
import Category from "../../../../domain/entities/category.entity";

describe("Delete Category UseCase Unit Test", () => {
    let repository: CategoryMemoryRepository;
    let useCase: DeleteCategoryUseCase;

    beforeEach(() => {
        repository = new CategoryMemoryRepository();
        useCase = new DeleteCategoryUseCase(repository);
    });

    test("Deve lançar InvalidUuidExeception com id fake", async () => {
        await expect(() => useCase.handle({ id: "fake" })).rejects.toThrow(new InvalidUuidException());
    });

    test("Deve lançar EntiityNotFoundExeception pq categoria não foi encontrada.", async () => {
        const uuid = new Uuid();
        
        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(new EntityNotFoundException(uuid.value, Category));
    });

    test("Deve deletar uma categoria", async () => {
        const spyDelete = jest.spyOn(repository, "delete");
        const category = Category.fake().aCategory().build();
        repository.insert(category);

        await repository.delete(category.categoryId);

        expect(spyDelete).toHaveBeenCalledTimes(1);
        expect(repository.items).toHaveLength(0);
    });
});
