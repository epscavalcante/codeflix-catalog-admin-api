import CategoriesIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.validation';
import CreateGenreUseCase from '../use-cases/create-genre.use-case';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import Category from '@core/category/domain/category.aggregate';
import GenreSequelizeRepository from '@core/genre/infra/repositories/genre-sequelize.repository';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import {
    GenreCategoryModel,
    GenreModel,
} from '@core/genre/infra/database/sequelize/models/genre.model';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import GenreId from '@core/genre/domain/genre.id.vo';
import ApplicationService from '@core/shared/application/application.service';
import EventEmitter2 from 'eventemitter2';
import DomainEventMediator from '@core/shared/domain/domain-events/domain-event.mediator';

describe('CreateGenreUseCase Unit Tests', () => {
    let useCase: CreateGenreUseCase;
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
        categoriesIdsDatabaseValidation =
            new CategoriesIdsExistsInDatabaseValidation(categoryRepository);
        useCase = new CreateGenreUseCase(
            new ApplicationService(
                unitOfWork,
                new DomainEventMediator(new EventEmitter2()),
            ),
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
            categoriesId: categories.map(
                (category) => category.categoryId.value,
            ),
        });

        const genreModel = await genreRepository.findById(
            new GenreId(output.id),
        );
        const categoriesRelated = await categoryRepository.findByIds(
            categories.map((category) => category.categoryId),
        );

        expect(spyInsert).toHaveBeenCalled();
        expect(output).toStrictEqual({
            id: genreModel!.genreId.value,
            name: genreModel!.name,
            createdAt: genreModel!.createdAt,
            categories: categoriesRelated.map((category) => ({
                id: category.categoryId.value,
                name: category.name,
                isActive: category.isActive,
            })),
            categoriesId: categoriesRelated.map(
                (category) => category.categoryId.value,
            ),
        });
    });
});
