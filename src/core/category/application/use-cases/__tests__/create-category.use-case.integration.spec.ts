import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import CreateCategoryUseCase from '../create-category.use-case';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import { CategoryId } from '@core/category/domain/category.aggregate';

describe('Create Category UseCase Integration Test', () => {
    let repository: CategorySequelizeRepository;
    let useCase: CreateCategoryUseCase;

    setupDatabase({ models: [CategoryModel] });

    beforeEach(() => {
        repository = new CategorySequelizeRepository(CategoryModel);
        useCase = new CreateCategoryUseCase(repository);
    });

    test('Deve criar uma categoria com valores default', async () => {
        const output = await useCase.handle({
            name: 'Test',
        });
        const category = await repository.findById(new CategoryId(output.id));

        expect(output).toStrictEqual({
            id: category!.categoryId.value,
            name: 'Test',
            description: null,
            isActive: true,
            createdAt: category!.createdAt,
        });
    });

    test('Deve lançar exception EntityValidationException', async () => {
        const input = {
            name: 'T'.repeat(256),
        };

        await expect(() => useCase.handle(input)).rejects.toThrowError(
            'Entity Validation Error',
        );
    });

    test('Deve criar uma categoria sem descrição e inativa', async () => {
        const output = await useCase.handle({
            name: 'Test',
            isActive: false,
        });

        const category = await repository.findById(new CategoryId(output.id));

        expect(output).toStrictEqual({
            id: category!.categoryId.value,
            name: 'Test',
            description: null,
            isActive: false,
            createdAt: category!.createdAt,
        });
    });

    test('Deve criar uma categoria com descrição e inativa', async () => {
        const output = await useCase.handle({
            name: 'Test',
            description: 'Test',
            isActive: false,
        });

        const category = await repository.findById(new CategoryId(output.id));

        expect(output).toStrictEqual({
            id: category!.categoryId.value,
            name: 'Test',
            description: 'Test',
            isActive: false,
            createdAt: category!.createdAt,
        });
    });
});
