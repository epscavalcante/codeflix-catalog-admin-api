import Uuid from "../../../../domain/value-objects/uuid.vo";
import InvalidUuidException from "../../../../domain/exceptions/invalid-uuid.exception";
import DeleteCategoryUseCase from "../delete-category.use-case";
import EntityNotFoundException from "../../../../domain/exceptions/entity-not-found.exception";
import Category from "../../../../domain/entities/category.entity";
import { setupDatabase } from "../../../../infra/helpers/setup-database";
import CategoryModel from "../../../../infra/models/sequelize/category.model";
import CategorySequelizeRepository from "../../../../infra/repositories/category-sequelize.repository";

describe("Delete Category UseCase Integration Test", () => {
    let repository: CategorySequelizeRepository;
    let useCase: DeleteCategoryUseCase;

    setupDatabase({ models: [CategoryModel]})

    beforeEach(() => {
        repository = new CategorySequelizeRepository(CategoryModel);
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

        const categoryFounded = await repository.findById(category.categoryId);

        expect(spyDelete).toHaveBeenCalledTimes(1);
        expect(categoryFounded).toBeNull();
    });
});
