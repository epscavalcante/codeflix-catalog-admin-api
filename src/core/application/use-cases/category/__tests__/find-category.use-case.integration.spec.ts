import Uuid from "../../../../domain/value-objects/uuid.vo";
import InvalidUuidException from "../../../../domain/exceptions/invalid-uuid.exception";
import CategorySequelizeRespository from "../../../../infra/repositories/category-sequelize.repository";
import FindCategoryUseCase from "../find-category.use-case";
import EntityNotFoundException from "../../../../domain/exceptions/entity-not-found.exception";
import Category from "../../../../domain/entities/category.entity";
import { setupDatabase } from "../../../../infra/helpers/setup-database";
import CategoryModel from "../../../../infra/models/sequelize/category.model";

describe("Find a Category UseCase Unit Test", () => {
    let repository: CategorySequelizeRespository;
    let useCase: FindCategoryUseCase;

    setupDatabase({ models: [CategoryModel]})

    beforeEach(() => {
        repository = new CategorySequelizeRespository(CategoryModel);
        useCase = new FindCategoryUseCase(repository);
    });

    test("Deve lançar InvalidUuidExeception com id fake", async () => {
        await expect(() => useCase.handle({ id: "fake" })).rejects.toThrow(
            new InvalidUuidException()
        );
    });

    test("Deve lançar EntiityNotFoundExeception pq categoria não foi encontrada.", async () => {
        const uuid = new Uuid();

        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(
            new EntityNotFoundException(uuid.value, Category)
        );
    });

    test("Deve retornar uma categoria", async () => {
        const spyFindById = jest.spyOn(repository, "findById");
        const category = Category.fake().aCategory().build();
        repository.insert(category);

        const output = await useCase.handle({ id: category.categoryId.value});

        expect(spyFindById).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: category.name,
            description: category.description,
            isActive: category.isActive,
            createdAt: category.createdAt,
        });
    });
});
