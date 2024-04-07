import Genre from '@core/genre/domain/genre.aggregate';
import GenreId from '@core/genre/domain/genre.id.vo';
import { GenreNotFoundError } from '@core/genre/domain/errors/genre-not-found.error';
import Category from '@core/category/domain/category.aggregate';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import GenreSequelizeRepository from './genre-sequelize.repository';
import {
    GenreCategoryModel,
    GenreModel,
} from '../database/sequelize/models/genre.model';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import {
    GenreSearchParams,
    GenreSearchResult,
} from '@core/genre/domain/genre.repository.interface';
import { GenreModelMapper } from '../database/mappers/genre-model.mapper';

describe('Integration Test Sequelize repository', () => {
    let unitOfWork: SequelizeUnitOfWorkRepository;
    let genreRepository: GenreSequelizeRepository;
    let categoryRepository: CategorySequelizeRepository;

    const sequelize = setupDatabase({
        models: [GenreModel, CategoryModel, GenreCategoryModel],
    });

    beforeEach(async () => {
        unitOfWork = new SequelizeUnitOfWorkRepository(sequelize.sequelize);
        genreRepository = new GenreSequelizeRepository(GenreModel, unitOfWork);
        categoryRepository = new CategorySequelizeRepository(CategoryModel);
    });

    test('Should insert an entity', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);
        const genre = Genre.fake()
            .aGenre()
            .addCategoryId(category.categoryId)
            .build();
        await genreRepository.insert(genre);

        const genreCreated = await genreRepository.findById(genre.genreId);
        expect(genreCreated!.toJSON()).toStrictEqual(genre!.toJSON());
    });

    test('Should bulk insert entities', async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepository.bulkInsert(categories);
        const genreOne = Genre.fake()
            .aGenre()
            .addCategoryId(categories[0].categoryId)
            .build();
        const genreTwo = Genre.fake()
            .aGenre()
            .addCategoryId(categories[1].categoryId)
            .addCategoryId(categories[2].categoryId)
            .build();
        await genreRepository.bulkInsert([genreOne, genreTwo]);

        const genresCreated = await genreRepository.findAll();
        await expect(GenreCategoryModel.count()).resolves.toBe(3);
        expect(genresCreated).toHaveLength(2);
        expect(genresCreated[0].toJSON()).toStrictEqual({
            ...genreOne.toJSON(),
            categoriesId: expect.arrayContaining([
                categories[0].categoryId.value,
            ]),
        });
        expect(genresCreated[1].toJSON()).toStrictEqual({
            ...genreTwo.toJSON(),
            categoriesId: expect.arrayContaining([
                categories[1].categoryId.value,
                categories[2].categoryId.value,
            ]),
        });
    });

    test('Should return all items', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);
        const genre = Genre.fake()
            .aGenre()
            .addCategoryId(category.categoryId)
            .build();
        await genreRepository.bulkInsert([genre]);

        const allItems = await genreRepository.findAll();
        expect(allItems).toHaveLength(1);
        expect(JSON.stringify(allItems)).toBe(JSON.stringify([genre]));
    });

    test('Should found a genre by Id', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);
        const genre = Genre.fake()
            .aGenre()
            .addCategoryId(category.categoryId)
            .build();
        await genreRepository.insert(genre);
        const genreFound = await genreRepository.findById(genre.genreId);

        expect(genreFound!.toJSON()).toStrictEqual(genre.toJSON());
    });

    describe('Update an Entity', () => {
        test('Should return Exception when update entity not exist', async () => {
            const entity = Genre.fake().aGenre().build();

            await expect(genreRepository.update(entity)).rejects.toThrow(
                new GenreNotFoundError(entity.genreId.value),
            );
        });

        test('Should update an entity', async () => {
            const categories = Category.fake().theCategories(3).build();
            await categoryRepository.bulkInsert(categories);
            const genre = Genre.fake()
                .aGenre()
                .addCategoryId(categories[0].categoryId)
                .build();
            await genreRepository.insert(genre);

            genre.changeName('Genre updated');
            genre.syncCategoriesId([
                categories[1].categoryId,
                categories[2].categoryId,
            ]);
            await genreRepository.update(genre);

            const genreFound = await genreRepository.findById(genre.genreId);
            expect(genre.toJSON()).toStrictEqual({
                ...genreFound!.toJSON(),
                categoriesId: expect.arrayContaining([
                    categories[1].categoryId.value,
                    categories[2].categoryId.value,
                ]),
            });
            await expect(GenreCategoryModel.count()).resolves.toBe(2);
        });
    });

    describe('Delete an Entity', () => {
        test('Should return Exception when entity not exist', async () => {
            const entityId = new GenreId();

            await expect(genreRepository.delete(entityId)).rejects.toThrow(
                new GenreNotFoundError(entityId.value),
            );
        });

        test('Should delete an entity', async () => {
            const category = Category.fake().aCategory().build();
            await categoryRepository.insert(category);
            const genre = Genre.fake()
                .aGenre()
                .addCategoryId(category.categoryId)
                .build();
            await genreRepository.insert(genre);
            await genreRepository.delete(genre.genreId);
            const genreDeleted = await GenreModel.findByPk(genre.genreId.value);
            expect(genreDeleted).toBeNull();
            await expect(GenreCategoryModel.count()).resolves.toBe(0);
        });
    });

    describe('Search items', () => {
        it('should no filter items search Params is defaul', async () => {
            const category = Category.fake().aCategory().build();
            await categoryRepository.insert(category);
            const genres = Genre.fake()
                .theGenres(20)
                .withCreatedAt(
                    (index) => new Date(new Date().getTime() + 100 + index),
                )
                .addCategoryId(category.categoryId)
                .build();
            await genreRepository.bulkInsert(genres);
            const genreModelMapper = jest.spyOn(
                GenreModelMapper,
                'toEntity' as any,
            );
            const searchSpy = jest.spyOn(genreRepository, 'search' as any);
            const genresSearchResult = await genreRepository.search(
                GenreSearchParams.create(),
            );
            expect(searchSpy).toHaveBeenCalled();
            expect(genreModelMapper).toHaveBeenCalledTimes(15);
            expect(genresSearchResult).toBeInstanceOf(GenreSearchResult);
            expect(genresSearchResult.toJSON()).toMatchObject({
                total: 20,
                currentPage: 1,
                lastPage: 2,
                perPage: 15,
            });

            [...genres.reverse().slice(0, 15)].forEach((item, index) => {
                expect(genresSearchResult.items[index]).toBeInstanceOf(Genre);
                const genreExpected = genresSearchResult.items[index].toJSON();
                expect(item.toJSON()).toStrictEqual({
                    ...genreExpected,
                    categoriesId: expect.arrayContaining([
                        category.categoryId.value,
                    ]),
                });
            });
        });
    });
});
