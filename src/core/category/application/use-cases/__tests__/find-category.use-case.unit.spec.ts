import Category, { CategoryId } from '@core/category/domain/category.aggregate';
import CategoryMemoryRepository from '@core/category/infra/repositories/category-memory.repository';
import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';
import FindCategoryUseCase from '../find-category.use-case';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';

describe('Find a Category UseCase Unit Test', () => {
    let repository: CategoryMemoryRepository;
    let useCase: FindCategoryUseCase;

    beforeEach(() => {
        repository = new CategoryMemoryRepository();
        useCase = new FindCategoryUseCase(repository);
    });

    test('Deve lançar InvalidUuidExeception com id fake', async () => {
        await expect(() => useCase.handle({ id: 'fake' })).rejects.toThrow(
            new InvalidUuidException(),
        );
    });

    test('Deve lançar EntiityNotFoundExeception pq categoria não foi encontrada.', async () => {
        const uuid = new CategoryId();

        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(
            new EntityNotFoundError(uuid.value, Category),
        );
    });

    test('Deve retornar uma categoria', async () => {
        const spyFindById = jest.spyOn(repository, 'findById');
        const category = Category.fake().aCategory().build();
        repository.insert(category);

        const output = await useCase.handle({ id: category.categoryId.value });

        expect(spyFindById).toHaveBeenCalledTimes(1);
        expect(repository.items).toHaveLength(1);
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: category.name,
            description: category.description,
            isActive: category.isActive,
            createdAt: category.createdAt,
        });
    });
});
