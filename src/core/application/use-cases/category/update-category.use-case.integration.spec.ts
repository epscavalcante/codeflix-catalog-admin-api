import Uuid from "../../../domain/value-objects/uuid.vo";
import InvalidUuidException from "../../../domain/exceptions/invalid-uuid.exception";
import UpdateCategoryUseCase from "./update-category.use-case";
import EntityNotFoundException from "../../../domain/exceptions/entity-not-found.exception";
import Category from "../../../domain/entities/category.entity";
import { setupDatabase } from "../../../infra/helpers/setup-database";
import CategoryModel from "../../../infra/models/sequelize/category.model";
import CategorySequelizeRepository from "../../../infra/repositories/category-sequelize.repository";

describe("Update Category UseCase Integration Test", () => {
    let repository: CategorySequelizeRepository;
    let useCase: UpdateCategoryUseCase;

    setupDatabase({ models: [CategoryModel] });

    beforeEach(() => {
        repository = new CategorySequelizeRepository(CategoryModel);
        useCase = new UpdateCategoryUseCase(repository);
    });

    test("Deve lançar exceção de categoria não encontrada", async () => {
        await expect(() => 
            useCase.handle({ id: "fake" })
        ).rejects.toThrow(new InvalidUuidException());

        const uuid = new Uuid();

        await expect(() => 
            useCase.handle({ id: uuid.value })
        ).rejects.toThrow(new EntityNotFoundException(uuid.value, Category));
    });

    test("Deve lançar exception EntityValidationException", async () => {
        const category = Category.fake().aCategory().build();
        await repository.insert(category);

        const input = {
            id: category.categoryId.value,
            name: "T".repeat(256),
        };

        await expect(() => useCase.handle(input)).rejects.toThrowError('Entity Validation Error');
    });

    test("Deve alterar o nome da categoria", async () => {
        const spyUpdate = jest.spyOn(repository, "update");
        const category = Category.fake().aCategory().withName('teste').build();
        await repository.insert(category);
       
        const output = await useCase.handle({
            id: category.categoryId.value,
            name: 'Changed'
        });

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: "Changed",
            description: category.description,
            isActive: category.isActive,
            createdAt: category.createdAt,
        });
    });

    test("Deve alterar a description da categoria", async () => {
        const spyUpdate = jest.spyOn(repository, "update");
        const category = Category.fake().aCategory().build();
        await repository.insert(category);
       
        const output = await useCase.handle({
            id: category.categoryId.value,
            description: 'Changed'
        });

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: category.name,
            description: 'Changed',
            isActive: category.isActive,
            createdAt: category.createdAt,
        });
    });

    test("Deve inativar uma categoria", async () => {
        const spyUpdate = jest.spyOn(repository, "update");
        const category = Category.fake().aCategory().activate().build();
        await repository.insert(category);
       
        const output = await useCase.handle({
            id: category.categoryId.value,
            isActive: false
        });

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: category.name,
            description: category.description,
            isActive: false,
            createdAt: category.createdAt
        });
    });

    test("Deve a ativar uma categoria", async () => {
        const spyUpdate = jest.spyOn(repository, "update");
        const category = Category.fake().aCategory().deactivate().build();
        await repository.insert(category);
       
        const output = await useCase.handle({
            id: category.categoryId.value,
            isActive: true
        });

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: category.name,
            description: category.description,
            isActive: true,
            createdAt: category.createdAt
        });
    });
});
