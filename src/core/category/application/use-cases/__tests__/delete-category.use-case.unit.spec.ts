import CategoryMemoryRepository from "@core/category/infra/repositories/category-memory.repository";
import DeleteCategoryUseCase from "../delete-category.use-case";
import EntityNotFoundError from "@core/shared/domain/errors/entity-not-found.error";
import Category, { CategoryId } from "@core/category/domain/category.aggregate";
import InvalidUuidException from "@core/shared/domain/errors/uuid-validation.error";

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
        const uuid = new CategoryId();
        
        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(new EntityNotFoundError(uuid.value, Category));
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
