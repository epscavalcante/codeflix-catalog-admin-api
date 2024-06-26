import CategoryMemoryRepository from '@core/category/infra/repositories/category-memory.repository';
import GenreMemoryRepository from '@core/genre/infra/repositories/genre-memory.repository';
import ListGenreUseCase from '../use-cases/list-genre.use-case';
import { GenreSearchResult } from '@core/genre/domain/genre.repository.interface';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import GenreOutputMapper from '../mappers/genre.use-case.output';

describe('ListGenre use case unit test', () => {
    let useCase: ListGenreUseCase;
    let genreRepository: GenreMemoryRepository;
    let categoryRepository: CategoryMemoryRepository;

    beforeEach(() => {
        genreRepository = new GenreMemoryRepository();
        categoryRepository = new CategoryMemoryRepository();
        useCase = new ListGenreUseCase(genreRepository, categoryRepository);
    });

    describe('Método toOuput', () => {
        test('Sem items', async () => {
            const result = new GenreSearchResult({
                items: [],
                currentPage: 1,
                perPage: 10,
                total: 0,
            });

            const output = await useCase['toOutput'](result);

            expect(output).toStrictEqual({
                items: [],
                currentPage: 1,
                perPage: 10,
                total: 0,
                lastPage: 0,
            });
        });

        test('Com items', async () => {
            const categories = Category.fake().theCategories(2).build();
            await categoryRepository.bulkInsert(categories);
            const genre = Genre.fake()
                .aGenre()
                .addCategoryId(categories[0].categoryId)
                .addCategoryId(categories[1].categoryId)
                .build();

            const result = new GenreSearchResult({
                items: [genre],
                currentPage: 1,
                perPage: 10,
                total: 1,
            });

            const output = await useCase['toOutput'](result);

            expect(output).toStrictEqual({
                items: [
                    {
                        id: genre.genreId.value,
                        name: genre.name,
                        createdAt: genre.createdAt,
                        categories: [
                            {
                                id: categories[0].categoryId.value,
                                name: categories[0].name,
                                isActive: categories[0].isActive,
                            },
                            {
                                id: categories[1].categoryId.value,
                                name: categories[1].name,
                                isActive: categories[1].isActive,
                            },
                        ],
                        categoriesId: [
                            categories[0].categoryId.value,
                            categories[1].categoryId.value,
                        ],
                    },
                ],
                currentPage: 1,
                perPage: 10,
                total: 1,
                lastPage: 1,
            });
        });
    });

    describe('Ordenação', () => {
        test('Deve ordernar pelo createdAt quando o inputParams é vazio', async () => {
            const categories = Category.fake().theCategories(4).build();
            await categoryRepository.bulkInsert(categories);

            const genres = [
                Genre.fake()
                    .aGenre()
                    .addCategoryId(categories[0].categoryId)
                    .build(),
                Genre.fake()
                    .aGenre()
                    .addCategoryId(categories[1].categoryId)
                    .withCreatedAt(new Date(new Date().getTime() + 100))
                    .build(),
            ];
            await genreRepository.bulkInsert(genres);

            const output = await useCase.handle({});

            expect(output).toStrictEqual({
                items: [
                    GenreOutputMapper.toOutput(genres[1], [categories[1]]),
                    GenreOutputMapper.toOutput(genres[0], [categories[0]]),
                ],
                total: 2,
                perPage: 15,
                lastPage: 1,
                currentPage: 1,
            });
        });
    });

    describe('Paginação', () => {
        test('Deve ordernar pelo createdAt quando o inputParams é vazio', async () => {
            const categories = Category.fake().theCategories(4).build();
            await categoryRepository.bulkInsert(categories);

            const genres = [
                Genre.fake()
                    .aGenre()
                    .addCategoryId(categories[0].categoryId)
                    .build(),
                Genre.fake()
                    .aGenre()
                    .addCategoryId(categories[1].categoryId)
                    .withCreatedAt(new Date(new Date().getTime() + 100))
                    .build(),
            ];
            await genreRepository.bulkInsert(genres);

            const outputFirstPage = await useCase.handle({
                page: 1,
                perPage: 1,
            });

            expect(outputFirstPage).toStrictEqual({
                items: [GenreOutputMapper.toOutput(genres[1], [categories[1]])],
                total: 2,
                perPage: 1,
                lastPage: 2,
                currentPage: 1,
            });

            const outputSecondPage = await useCase.handle({
                page: 2,
                perPage: 1,
            });

            expect(outputSecondPage).toStrictEqual({
                items: [GenreOutputMapper.toOutput(genres[0], [categories[0]])],
                total: 2,
                perPage: 1,
                lastPage: 2,
                currentPage: 2,
            });
        });
    });

    describe('Filtro', () => {
        test('Deve filtrar pelo nome', async () => {
            const categories = Category.fake().theCategories(4).build();
            await categoryRepository.bulkInsert(categories);

            const genres = [
                Genre.fake()
                    .aGenre()
                    .withName('test')
                    .addCategoryId(categories[0].categoryId)
                    .build(),
                Genre.fake()
                    .aGenre()
                    .withName('TEST')
                    .addCategoryId(categories[1].categoryId)
                    .withCreatedAt(new Date(new Date().getTime() + 100))
                    .build(),
                Genre.fake()
                    .aGenre()
                    .withName('fake')
                    .addCategoryId(categories[2].categoryId)
                    .addCategoryId(categories[3].categoryId)
                    .build(),
            ];
            await genreRepository.bulkInsert(genres);

            const output = await useCase.handle({
                filter: { name: 'fake' },
            });

            expect(output).toStrictEqual({
                items: [
                    GenreOutputMapper.toOutput(genres[2], [
                        categories[2],
                        categories[3],
                    ]),
                ],
                total: 1,
                perPage: 15,
                lastPage: 1,
                currentPage: 1,
            });
        });
    });
});
