import { DataType } from 'sequelize-typescript';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import { GenreCategoryModel, GenreModel, GenreModelProps } from './genre.model';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import Category from '@core/category/domain/category.aggregate';
import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';

setupDatabase({ models: [GenreModel, CategoryModel, GenreCategoryModel] });

describe('Genre Model Tests', () => {
    test('Check table name', () => {
        expect(GenreModel.getTableName()).toBe('genres');
    });

    describe('Check model props', () => {
        test('check defined props ', () => {
            const attributes = GenreModel.getAttributes();
            expect(Object.keys(attributes)).toStrictEqual([
                'genreId',
                'name',
                'createdAt',
            ]);
        });

        test('check id prop ', () => {
            const attributes = GenreModel.getAttributes();

            expect(attributes.genreId).toMatchObject({
                field: 'genre_id',
                fieldName: 'genreId',
                primaryKey: true,
                type: DataType.UUID(),
            });
        });

        test('check name prop ', () => {
            const attributes = GenreModel.getAttributes();

            expect(attributes.name).toMatchObject({
                field: 'name',
                fieldName: 'name',
                allowNull: false,
                type: DataType.STRING(255),
            });
        });

        test('check createdAt prop ', () => {
            const attributes = GenreModel.getAttributes();

            expect(attributes.createdAt).toMatchObject({
                field: 'created_at',
                fieldName: 'createdAt',
                allowNull: false,
                type: DataType.DATE(3),
            });
        });
    });

    describe('Check associations', () => {
        test('Check associations fields', () => {
            const associationsKeys = Object.keys(GenreModel.associations);

            expect(associationsKeys).toStrictEqual([
                'categoriesId',
                'categories',
            ]);
        });

        test('Check association categoriesId Field', () => {
            const categoriesIdField = GenreModel.associations.categoriesId;

            expect(categoriesIdField).toMatchObject({
                associationType: 'HasMany',
                source: GenreModel,
                target: GenreCategoryModel,
                options: {
                    foreignKey: { name: 'genreId' },
                    as: 'categoriesId',
                },
            });
        });

        test('Check association categories Field', () => {
            const categoriesIdField = GenreModel.associations.categories;

            expect(categoriesIdField).toMatchObject({
                associationType: 'BelongsToMany',
                source: GenreModel,
                target: CategoryModel,
                options: {
                    through: { model: GenreCategoryModel },
                    foreignKey: { name: 'genreId' },
                    otherKey: { name: 'categoryId' },
                    as: 'categories',
                },
            });
        });
    });

    test('Should create a genre without categories', async () => {
        const data: GenreModelProps = {
            genreId: '3e3b4710-bf7c-49a8-b49f-788d42ff2e90',
            name: 'genre',
            createdAt: new Date(),
        };
        const genreModel = await GenreModel.create(data);

        expect(genreModel.toJSON()).toStrictEqual(data);
    });

    test('Should create a genre with categories', async () => {
        const categories = Category.fake().theCategories(2).build();
        const categoryRepository = new CategorySequelizeRepository(
            CategoryModel,
        );
        await categoryRepository.bulkInsert(categories);

        const genreId = '3e3b4710-bf7c-49a8-b49f-788d42ff2e90';
        const data: GenreModelProps = {
            genreId,
            name: 'genre',
            categoriesId: [
                GenreCategoryModel.build({
                    genreId,
                    categoryId: categories[0].categoryId.value,
                }),
                GenreCategoryModel.build({
                    genreId,
                    categoryId: categories[1].categoryId.value,
                }),
            ],
            createdAt: new Date(),
        };
        const genreModel = await GenreModel.create(data, {
            include: ['categoriesId'],
        });
        const genreModelWithCategories = await GenreModel.findByPk(
            genreModel.genreId,
            {
                include: [
                    {
                        model: CategoryModel,
                        attributes: ['categoryId'],
                    },
                ],
            },
        );

        expect(genreModelWithCategories).toMatchObject(data);
        expect(genreModelWithCategories!.categories).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    categoryId: categories[0].categoryId.value,
                }),
                expect.objectContaining({
                    categoryId: categories[1].categoryId.value,
                }),
            ]),
        );
    });

    test.only('Should create a genre and after insert categories', async () => {
        const categories = Category.fake().theCategories(2).build();
        const categoryRepository = new CategorySequelizeRepository(
            CategoryModel,
        );
        await categoryRepository.bulkInsert(categories);

        const data: GenreModelProps = {
            genreId: '3e3b4710-bf7c-49a8-b49f-788d42ff2e90',
            name: 'genre',
            createdAt: new Date(),
        };
        const genreModel = await GenreModel.create(data);
        await genreModel.$add('categories', [
            categories[0].categoryId.value,
            categories[1].categoryId.value,
        ]);
        const genreModelWithCategories = await GenreModel.findByPk(
            genreModel.genreId,
            {
                include: [
                    {
                        model: CategoryModel,
                        attributes: ['categoryId'],
                    },
                ],
            },
        );

        expect(genreModelWithCategories).toMatchObject(data);
        expect(genreModelWithCategories!.categories).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    categoryId: categories[0].categoryId.value,
                }),
                expect.objectContaining({
                    categoryId: categories[1].categoryId.value,
                }),
            ]),
        );
    });
});

describe.only('GenreCategory Model Tests', () => {
    test('Check table name', () => {
        expect(GenreCategoryModel.getTableName()).toBe('category_genre');
    });

    describe('Check model props', () => {
        test('check defined props ', () => {
            const attributes = GenreCategoryModel.getAttributes();
            expect(Object.keys(attributes)).toStrictEqual([
                'genreId',
                'categoryId',
            ]);
        });

        test('check genreId prop ', () => {
            const attributes = GenreCategoryModel.getAttributes();
            expect(attributes.genreId).toMatchObject({
                field: 'genre_id',
                fieldName: 'genreId',
                primaryKey: true,
                type: DataType.UUID(),
                references: {
                    model: 'genres',
                    key: 'genre_id',
                },
                unique: 'category_genre_genreId_categoryId_unique',
            });
        });

        test('check categoryId prop ', () => {
            const attributes = GenreCategoryModel.getAttributes();
            expect(attributes.categoryId).toMatchObject({
                field: 'category_id',
                fieldName: 'categoryId',
                primaryKey: true,
                type: DataType.UUID(),
                references: {
                    model: 'categories',
                    key: 'category_id',
                },
                unique: 'category_genre_genreId_categoryId_unique',
            });
        });
    });
});
