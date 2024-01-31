import GenreMemoryRepository from '@core/genre/infra/repositories/genre-memory.repository';
import CategoryMemoryRepository from '@core/category/infra/repositories/category-memory.repository';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import UpdateGenreUseCase from '../use-cases/update-genre.use-case';
import MemoryUnitOfWorkRepository from '@core/shared/infra/repositories/memory-unit-of-work.repository';
import CategoriesIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.validation';

describe('UpdateGenreUseCase Unit Tests', () => {
    let useCase: UpdateGenreUseCase;
    let genreRepository: GenreMemoryRepository;
    let categoryRepository: CategoryMemoryRepository;
    let categoriesIdsDatabaseValidation: CategoriesIdsExistsInDatabaseValidation;

    beforeEach(() => {
        genreRepository = new GenreMemoryRepository();
        categoryRepository = new CategoryMemoryRepository();
        categoriesIdsDatabaseValidation = new CategoriesIdsExistsInDatabaseValidation(
            categoryRepository,
        );
        useCase = new UpdateGenreUseCase(
            new MemoryUnitOfWorkRepository(),
            genreRepository,
            categoryRepository,
            categoriesIdsDatabaseValidation,
        );
    });

    test('Deve lançar EntityValidationError when categoriesId not exists', async () => {
        expect.assertions(3);
        const genre = Genre.fake().aGenre().withName('Test').build();
        await genreRepository.insert(genre);
        const spyValidateCategoriesId = jest.spyOn(
            categoriesIdsDatabaseValidation,
            'validate',
        );

        try {
            await useCase.handle({
                id: genre.genreId.value,
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

    test('Deve atualizar um gênero', async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepository.bulkInsert(categories);
        const genre = Genre.fake()
            .aGenre()
            .withName('Test')
            .addCategoryId(categories[0].categoryId)
            .build();
        await genreRepository.insert(genre);

        const spyInsert = jest.spyOn(genreRepository, 'update');
        const spyValidateCategoriesId = jest.spyOn(
            categoriesIdsDatabaseValidation,
            'validate',
        );

        const output = await useCase.handle({
            id: genre.genreId.value,
            name: 'Genero',
            categoriesId: [
                categories[1].categoryId.value,
                categories[2].categoryId.value,
            ],
        });

        expect(spyInsert).toHaveBeenCalled();
        expect(spyValidateCategoriesId).toHaveBeenCalled();
        expect(output).toStrictEqual({
            id: genreRepository.items[0].genreId.value,
            name: 'Genero',
            createdAt: genreRepository.items[0].createdAt,
            categories: [
                {
                    id: categories[1].categoryId.value,
                    name: categories[1].name,
                    isActive: categories[1].isActive,
                },
                {
                    id: categories[2].categoryId.value,
                    name: categories[2].name,
                    isActive: categories[2].isActive,
                },
            ],
            categoriesId: [
                categories[1].categoryId.value,
                categories[2].categoryId.value,
            ],
        });
    });
});
