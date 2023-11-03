import Uuid from "../../../../domain/value-objects/uuid.vo";
import InvalidUuidException from "../../../../domain/exceptions/invalid-uuid.exception";
import CategoryMemoryRepository from "../../../../infra/repositories/category-memory.repository";
import UpdateCategoryUseCase from "../update-category.use-case";
import EntityNotFoundException from "../../../../domain/exceptions/entity-not-found.exception";
import Category from "../../../../domain/entities/category.aggregate";

describe("Update Category UseCase UnitTest", () => {
    let repository: CategoryMemoryRepository;
    let useCase: UpdateCategoryUseCase;

    beforeEach(() => {
        repository = new CategoryMemoryRepository();
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
        const category = new Category({name: 'Test'});
        repository.items = [category];
        const input = {
            id: category.categoryId.value,
            name: "T".repeat(256),
        };

        expect(() => useCase.handle(input)).rejects.toThrowError('Entity Validation Error');
    });

    test("Deve alterar o nome da categoria", async () => {
        const spyUpdate = jest.spyOn(repository, "update");
        const category = new Category({name: 'Test'});
        repository.items.push(category);
       
        const output = await useCase.handle({
            id: category.categoryId.value,
            name: 'Changed'
        });

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: "Changed",
            description: null,
            isActive: true,
            createdAt: repository.items[0].createdAt,
        });
    });

    test("Deve alterar a description da categoria", async () => {
        const spyUpdate = jest.spyOn(repository, "update");
        const category = new Category({name: 'Test'});
        repository.items.push(category);
       
        const output = await useCase.handle({
            id: category.categoryId.value,
            description: 'Changed'
        });

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: "Test",
            description: 'Changed',
            isActive: true,
            createdAt: repository.items[0].createdAt,
        });
    });

    test("Deve inativar uma categoria", async () => {
        const spyUpdate = jest.spyOn(repository, "update");
        const category = new Category({name: 'Test'});
        repository.items.push(category);
       
        const output = await useCase.handle({
            id: category.categoryId.value,
            isActive: false
        });

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: "Test",
            description: null,
            isActive: false,
            createdAt: repository.items[0].createdAt,
        });
    });

    test("Deve a ativar uma categoria", async () => {
        const spyUpdate = jest.spyOn(repository, "update");
        const category = new Category({name: 'Test', isActive: false});
        repository.items.push(category);
       
        const output = await useCase.handle({
            id: category.categoryId.value,
            isActive: true
        });

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: "Test",
            description: null,
            isActive: true,
            createdAt: repository.items[0].createdAt,
        });
    });
});
