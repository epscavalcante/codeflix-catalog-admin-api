import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import UpdateGenreUseCase from '../use-cases/update-genre.use-case';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import {
    GenreCategoryModel,
    GenreModel,
} from '@core/genre/infra/database/sequelize/models/genre.model';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import GenreSequelizeRepository from '@core/genre/infra/repositories/genre-sequelize.repository';
import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import CategoriesIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.validation';

setupDatabase({ models: [GenreModel, CategoryModel, GenreCategoryModel] });

describe('UpdateGenreUseCase integration Test', () => {
    let useCase: UpdateGenreUseCase;
    let unitOfWork: SequelizeUnitOfWorkRepository;
    let genreRepository: GenreSequelizeRepository;
    let categoryRepository: CategorySequelizeRepository;
    let categoriesIdsDatabaseValidation: CategoriesIdsExistsInDatabaseValidation;

    const database = setupDatabase({
        models: [GenreModel, CategoryModel, GenreCategoryModel],
    });

    beforeEach(() => {
        unitOfWork = new SequelizeUnitOfWorkRepository(database.sequelize);
        genreRepository = new GenreSequelizeRepository(GenreModel, unitOfWork);
        categoryRepository = new CategorySequelizeRepository(CategoryModel);
        categoriesIdsDatabaseValidation = new CategoriesIdsExistsInDatabaseValidation(
            categoryRepository,
        );
        useCase = new UpdateGenreUseCase(
            unitOfWork,
            genreRepository,
            categoryRepository,
            categoriesIdsDatabaseValidation,
        );
    });

    test('Deve lançar EntityValidationError when categoriesId not exists', async () => {
        expect.assertions(3);
        const categories = Category.fake().theCategories(3).build();
        await categoryRepository.bulkInsert(categories);
        const genre = Genre.fake()
            .aGenre()
            .addCategoryId(categories[0].categoryId)
            .withName('Test')
            .build();
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
            categoriesId: [categories[2].categoryId.value],
        });

        const genreModel = await genreRepository.findById(genre.genreId);

        expect(spyInsert).toHaveBeenCalled();
        expect(spyValidateCategoriesId).toHaveBeenCalled();
        expect(output).toStrictEqual({
            id: genre.genreId.value,
            name: 'Genero',
            createdAt: genre.createdAt,
            categories: [
                {
                    id: categories[2].categoryId.value,
                    name: categories[2].name,
                    isActive: categories[2].isActive,
                },
            ],
            categoriesId: [categories[2].categoryId.value],
        });
    });
});
