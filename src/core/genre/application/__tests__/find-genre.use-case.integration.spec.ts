import FindGenreUseCase from '../use-cases/find-genre.use-case';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';
import GenreId from '@core/genre/domain/genre.id.vo';
import { GenreNotFoundError } from '@core/genre/domain/errors/genre-not-found.error';
import Genre from '@core/genre/domain/genre.aggregate';
import Category from '@core/category/domain/category.aggregate';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import {
    GenreCategoryModel,
    GenreModel,
} from '@core/genre/infra/database/sequelize/models/genre.model';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import GenreSequelizeRepository from '@core/genre/infra/repositories/genre-sequelize.repository';
import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';

setupDatabase({ models: [GenreModel, CategoryModel, GenreCategoryModel] });

describe('FindGenreUseCase integration Test', () => {
    let useCase: FindGenreUseCase;
    let unitOfWork: SequelizeUnitOfWorkRepository;
    let genreRepository: GenreSequelizeRepository;
    let categoryRepository: CategorySequelizeRepository;
    const database = setupDatabase({
        models: [GenreModel, CategoryModel, GenreCategoryModel],
    });

    beforeEach(() => {
        unitOfWork = new SequelizeUnitOfWorkRepository(database.sequelize);
        genreRepository = new GenreSequelizeRepository(GenreModel, unitOfWork);
        categoryRepository = new CategorySequelizeRepository(CategoryModel);
        useCase = new FindGenreUseCase(genreRepository, categoryRepository);
    });

    test('Deve lançar InvalidUuidExeception com id fake', async () => {
        await expect(() => useCase.handle({ id: 'fake' })).rejects.toThrow(
            new InvalidUuidException(),
        );
    });

    test('Deve lançar GetNotFoundExeception pq gênero não foi encontrada.', async () => {
        const uuid = new GenreId();

        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(
            new GenreNotFoundError(uuid.value),
        );
    });

    test('Deve retornar um gênero', async () => {
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
