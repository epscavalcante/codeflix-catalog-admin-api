import GenreMemoryRepository from '@core/genre/infra/repositories/genre-memory.repository';
import FindGenreUseCase from '../use-cases/find-genre.use-case';
import CategoryMemoryRepository from '@core/category/infra/repositories/category-memory.repository';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';
import GenreId from '@core/genre/domain/genre.id.vo';
import { GenreNotFoundError } from '@core/genre/domain/errors/genre-not-found.error';
import Genre from '@core/genre/domain/genre.aggregate';
import Category from '@core/category/domain/category.aggregate';

describe('ListGenre use case unit test', () => {
    let useCase: FindGenreUseCase;
    let genreRepository: GenreMemoryRepository;
    let categoryRepository: CategoryMemoryRepository;

    beforeEach(() => {
        genreRepository = new GenreMemoryRepository();
        categoryRepository = new CategoryMemoryRepository();
        useCase = new FindGenreUseCase(genreRepository, categoryRepository);
    });

    test('Deve lançar InvalidUuidExeception com id fake', async () => {
        await expect(() => useCase.handle({ id: 'fake' })).rejects.toThrow(
            new InvalidUuidException(),
        );
    });

    test('Deve lançar EntiityNotFoundExeception pq categoria não foi encontrada.', async () => {
        const uuid = new GenreId();

        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(
            new GenreNotFoundError(uuid.value),
        );
    });

    test('Deve retornar um gênero com categoria.', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);
        const genre = Genre.fake()
            .aGenre()
            .addCategoryId(category.categoryId)
            .build();
        await genreRepository.insert(genre);

        const spyGenreFindById = jest.spyOn(genreRepository, 'findById');
        const spyCategoryFindByIds = jest.spyOn(
            categoryRepository,
            'findByIds',
        );
        const output = await useCase.handle({ id: genre.genreId.value });

        expect(spyGenreFindById).toHaveBeenCalled();
        expect(spyCategoryFindByIds).toHaveBeenCalled();
        expect(output).toStrictEqual({
            id: genre.genreId.value,
            name: genre.name,
            createdAt: genre.createdAt,
            categories: [
                {
                    id: category.categoryId.value,
                    name: category.name,
                    isActive: category.isActive,
                },
            ],
            categoriesId: [category.categoryId.value],
        });
    });
});
