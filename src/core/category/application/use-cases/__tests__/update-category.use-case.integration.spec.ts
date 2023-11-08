import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import UpdateCategoryUseCase from '../update-category.use-case';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import Category, { CategoryId } from '@core/category/domain/category.aggregate';
import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';

describe('Update Category UseCase Integration Test', () => {
    let repository: CategorySequelizeRepository;
    let useCase: UpdateCategoryUseCase;

    setupDatabase({ models: [CategoryModel] });

    beforeEach(() => {
        repository = new CategorySequelizeRepository(CategoryModel);
        useCase = new UpdateCategoryUseCase(repository);
    });

    test('Deve lançar exceção de categoria não encontrada', async () => {
        await expect(() => useCase.handle({ id: 'fake' })).rejects.toThrow(
            new InvalidUuidException(),
        );

        const uuid = new CategoryId();

        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(
            new EntityNotFoundError(uuid.value, Category),
        );
    });

    test('Deve lançar exception EntityValidationError', async () => {
        const category = Category.fake().aCategory().build();
        await repository.insert(category);

        const input = {
            id: category.categoryId.value,
            name: 'T'.repeat(256),
        };

        await expect(() => useCase.handle(input)).rejects.toThrowError(
            'Entity Validation Error',
        );
    });

    test('Deve alterar o nome da categoria', async () => {
        const spyUpdate = jest.spyOn(repository, 'update');
        const category = Category.fake().aCategory().withName('teste').build();
        await repository.insert(category);

        const output = await useCase.handle({
            id: category.categoryId.value,
            name: 'Changed',
        });

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: 'Changed',
            description: category.description,
            isActive: category.isActive,
            createdAt: category.createdAt,
        });
    });

    test('Deve alterar a description da categoria', async () => {
        const spyUpdate = jest.spyOn(repository, 'update');
        const category = Category.fake().aCategory().build();
        await repository.insert(category);

        const output = await useCase.handle({
            id: category.categoryId.value,
            description: 'Changed',
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

    test('Deve inativar uma categoria', async () => {
        const spyUpdate = jest.spyOn(repository, 'update');
        const category = Category.fake().aCategory().activate().build();
        await repository.insert(category);

        const output = await useCase.handle({
            id: category.categoryId.value,
            isActive: false,
        });

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: category.name,
            description: category.description,
            isActive: false,
            createdAt: category.createdAt,
        });
    });

    test('Deve a ativar uma categoria', async () => {
        const spyUpdate = jest.spyOn(repository, 'update');
        const category = Category.fake().aCategory().deactivate().build();
        await repository.insert(category);

        const output = await useCase.handle({
            id: category.categoryId.value,
            isActive: true,
        });

        expect(spyUpdate).toHaveBeenCalledTimes(1);
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: category.name,
            description: category.description,
            isActive: true,
            createdAt: category.createdAt,
        });
    });
});
