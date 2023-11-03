import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import DeleteCategoryUseCase from '../delete-category.use-case';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import InvalidUuidException from '@core/shared/domain/exceptions/invalid-uuid.exception';
import Category, { CategoryId } from '@core/category/domain/category.aggregate';
import EntityNotFoundException from '@core/shared/domain/exceptions/entity-not-found.exception';

describe('Delete Category UseCase Integration Test', () => {
    let repository: CategorySequelizeRepository;
    let useCase: DeleteCategoryUseCase;

    setupDatabase({ models: [CategoryModel] });

    beforeEach(() => {
        repository = new CategorySequelizeRepository(CategoryModel);
        useCase = new DeleteCategoryUseCase(repository);
    });

    test('Deve lançar InvalidUuidExeception com id fake', async () => {
        await expect(() => useCase.handle({ id: 'fake' })).rejects.toThrow(
            new InvalidUuidException(),
        );
    });

    test('Deve lançar EntiityNotFoundExeception pq categoria não foi encontrada.', async () => {
        const uuid = new CategoryId();

        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(
            new EntityNotFoundException(uuid.value, Category),
        );
    });

    test('Deve deletar uma categoria', async () => {
        const spyDelete = jest.spyOn(repository, 'delete');
        const category = Category.fake().aCategory().build();
        repository.insert(category);

        await repository.delete(category.categoryId);

        const categoryFounded = await repository.findById(category.categoryId);

        expect(spyDelete).toHaveBeenCalledTimes(1);
        expect(categoryFounded).toBeNull();
    });
});
