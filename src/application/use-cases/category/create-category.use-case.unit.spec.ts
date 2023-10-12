import CategoryMemoryRespository from "../../../infra/repositories/category-memory.repository";
import CreateCategoryUseCase from "./create-category.use-case";

describe('Create Category UseCase Unit Test', () => {
    let repository: CategoryMemoryRespository;
    let useCase: CreateCategoryUseCase;

    beforeEach(() => {
        repository = new CategoryMemoryRespository();
        useCase = new CreateCategoryUseCase(repository);
    });

    test('Deve criar uma categoria com valores default', async () => {
        const spyInsert = jest.spyOn(repository, 'insert');

        const output = await useCase.handle({
            name: 'Test',
        });

        expect(spyInsert).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: repository.items[0].categoryId.value,
            name: 'Test',
            description: null,
            isActive: true,
            createdAt: repository.items[0].createdAt
        });
    });

    test('Deve criar uma categoria sem descrição e inativa', async () => {
        const spyInsert = jest.spyOn(repository, 'insert');

        const output = await useCase.handle({
            name: 'Test',
            isActive: false
        });

        expect(spyInsert).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: repository.items[0].categoryId.value,
            name: 'Test',
            description: null,
            isActive: false,
            createdAt: repository.items[0].createdAt
        });
    });

    test('Deve criar uma categoria com descrição e inativa', async () => {
        const spyInsert = jest.spyOn(repository, 'insert');

        const output = await useCase.handle({
            name: 'Test',
            description: 'Test',
            isActive: false
        });

        expect(spyInsert).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: repository.items[0].categoryId.value,
            name: 'Test',
            description: 'Test',
            isActive: false,
            createdAt: repository.items[0].createdAt
        });
    });

})