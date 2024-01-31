import DeleteGenreUseCase from '../use-cases/delete-genre.use-case';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';
import GenreId from '@core/genre/domain/genre.id.vo';
import { GenreNotFoundError } from '@core/genre/domain/errors/genre-not-found.error';
import Genre from '@core/genre/domain/genre.aggregate';
import GenreSequelizeRepository from '@core/genre/infra/repositories/genre-sequelize.repository';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import {
    GenreCategoryModel,
    GenreModel,
} from '@core/genre/infra/database/sequelize/models/genre.model';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import Category from '@core/category/domain/category.aggregate';

setupDatabase({ models: [GenreModel, CategoryModel, GenreCategoryModel] });

describe('DeleteGenreUseCase integration Test', () => {
    let useCase: DeleteGenreUseCase;
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
        useCase = new DeleteGenreUseCase(unitOfWork, genreRepository);
    });

    test('Deve lançar InvalidUuidExeception com id fake', async () => {
        await expect(() => useCase.handle({ id: 'fake' })).rejects.toThrow(
            new InvalidUuidException(),
        );
    });

    test('Deve lançar GenreNotFoundExeception pq genre não foi encontrado.', async () => {
        const uuid = new GenreId();

        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(
            new GenreNotFoundError(uuid.value),
        );
    });

    test('Deve deletar um gênero', async () => {
        const spyDelete = jest.spyOn(genreRepository, 'delete');
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);
        const genre = Genre.fake()
            .aGenre()
            .addCategoryId(category.categoryId)
            .build();
        await genreRepository.insert(genre);

        await genreRepository.delete(genre.genreId);

        expect(spyDelete).toHaveBeenCalledTimes(1);
        expect(await genreRepository.findAll()).toHaveLength(0);
    });
});
