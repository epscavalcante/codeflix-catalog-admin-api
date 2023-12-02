import ExistsInDatabaseValidation from '@core/category/application/validations/exists-in-database.validation';
import CreateGenreUseCase from '../use-cases/create-genre.use-case';
import GenreMemoryRepository from '@core/genre/infra/repositories/genre-memory.repository';
import CategoryMemoryRepository from '@core/category/infra/repositories/category-memory.repository';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import Category from '@core/category/domain/category.aggregate';

describe('CreateGenreUseCase Unit Tests', () => {
    let useCase: CreateGenreUseCase;
    let genreRepository: GenreMemoryRepository;
    let categoryRepository: CategoryMemoryRepository;
    let categoriesIdsDatabaseValidation: ExistsInDatabaseValidation;

    beforeEach(() => {
        genreRepository = new GenreMemoryRepository();
        categoryRepository = new CategoryMemoryRepository();
        categoriesIdsDatabaseValidation = new ExistsInDatabaseValidation(
            categoryRepository,
        );
        useCase = new CreateGenreUseCase(
            genreRepository,
            categoryRepository,
            categoriesIdsDatabaseValidation,
        );
    });

    test('Deve lançar EntityValidationError when categoriesId not exists', async () => {
        expect.assertions(3);
        const spyValidateCategoriesId = jest.spyOn(
            categoriesIdsDatabaseValidation,
            'validate',
        );

        try {
            await useCase.handle({
                name: 'test',
                categoriesId: [
                    '4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
                    '7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
                ],
            });
        } catch (error) {
            expect(spyValidateCategoriesId).toHaveBeenCalledWith([
                '4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
                '7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
            ]);
            expect(error).toBeInstanceOf(EntityValidationError);
            expect(error.error).toStrictEqual([
                {
                    categoriesId: [
                        'Category not found using ID: 4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
                        'Category not found using ID: 7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
                    ],
                },
            ]);
        }
    });

    test('Deve criar um gênero', async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepository.bulkInsert(categories);
        const spyInsert = jest.spyOn(genreRepository, 'insert');

        const output = await useCase.handle({
            name: 'Genero',
            categoriesId: categories.map(category => category.categoryId.value)
        });

        expect(spyInsert).toHaveBeenCalled();
        expect(output).toStrictEqual({
            id: genreRepository.items[0].genreId.value,
            name: 'Genero',
            createdAt: genreRepository.items[0].createdAt,
            categories: categories.map(category => ({
                id: category.categoryId.value,
                name: category.name,
                isActive: category.isActive
            })),
            categoriesId: categories.map(category => category.categoryId.value)
        })
    });
});
