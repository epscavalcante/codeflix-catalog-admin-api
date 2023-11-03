import { setupDatabase } from "@core/shared/infra/database/setup-database";
import FindCategoryUseCase from "../find-category.use-case";
import CategoryModel from "@core/category/infra/database/sequelize/models/category.model";
import CategorySequelizeRepository from "@core/category/infra/repositories/category-sequelize.repository";
import InvalidUuidException from "@core/shared/domain/exceptions/invalid-uuid.exception";
import Category, { CategoryId } from "@core/category/domain/category.aggregate";
import EntityNotFoundException from "@core/shared/domain/exceptions/entity-not-found.exception";

describe("Find a Category UseCase Unit Test", () => {
    let repository: CategorySequelizeRepository;
    let useCase: FindCategoryUseCase;

    setupDatabase({ models: [CategoryModel]})

    beforeEach(() => {
        repository = new CategorySequelizeRepository(CategoryModel);
        useCase = new FindCategoryUseCase(repository);
    });

    test("Deve lançar InvalidUuidExeception com id fake", async () => {
        await expect(() => useCase.handle({ id: "fake" })).rejects.toThrow(
            new InvalidUuidException()
        );
    });

    test("Deve lançar EntiityNotFoundExeception pq categoria não foi encontrada.", async () => {
        const uuid = new CategoryId();

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
