import ICategoryRepository from '@core/category/domain/category.repository.interface';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import {
    GenreCategoryModel,
    GenreModel,
} from '../sequelize/models/genre.model';
import { GenreModelMapper } from './genre-model.mapper';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import GenreId from '@core/genre/domain/genre.id.vo';

describe('GenreModelMapper Unit Tests', () => {
    let categoryRepository: ICategoryRepository;
    setupDatabase({ models: [CategoryModel, GenreModel, GenreCategoryModel] });

    beforeEach(() => {
        categoryRepository = new CategorySequelizeRepository(CategoryModel);
    });

    it('Deve lançar exceção gênero inválido', async () => {
        const arrange = [
            {
                makeModel: () => {
                    return GenreModel.build({
                        genreId: '9366b7dc-2d71-4799-b91c-c64adb205104',
                        name: 't'.repeat(256),
                        categoriesId: [],
                        createdAt: new Date(),
                    });
                },
                expectedErrors: [
                    {
                        categoriesId: ['categoriesId should not be empty'],
                    },
                    {
                        name: [
                            'name must be shorter than or equal to 255 characters',
                        ],
                    },
                ],
            },
            {
                makeModel: () => {
                    return GenreModel.build({
                        genreId: '9366b7dc-2d71-4799-b91c-c64adb205104',
                        name: 't',
                        categoriesId: [],
                        createdAt: new Date(),
                    });
                },
                expectedErrors: [
                    {
                        categoriesId: ['categoriesId should not be empty'],
                    },
                    {
                        name: [
                            'name must be longer than or equal to 3 characters',
                        ],
                    },
                ],
            },
        ];

        for (const item of arrange) {
            try {
                GenreModelMapper.toEntity(item.makeModel());
                fail(
                    'The genre is valid, but it needs throws a EntityValidationError',
                );
            } catch (e) {
                expect(e).toBeInstanceOf(EntityValidationError);
                expect(e.error).toMatchObject(item.expectedErrors);
            }
        }
    });

    test('Deve converter um model para entidade', async () => {
        const category1 = Category.fake().aCategory().build();
        const category2 = Category.fake().aCategory().build();
        await categoryRepository.bulkInsert([category1, category2]);
        const createdAt = new Date();
        const genreId = '5490020a-e866-4229-9adc-aa44b83234c4';
        const model = await GenreModel.create(
            {
                genreId,
                name: 'Test',
                createdAt,
                categoriesId: [
                    GenreCategoryModel.build({
                        genreId,
                        categoryId: category1.categoryId.value,
                    }),
                    GenreCategoryModel.build({
                        genreId,
                        categoryId: category2.categoryId.value,
                    }),
                ],
            },
            { include: ['categoriesId'] },
        );
        const entity = GenreModelMapper.toEntity(model);
        expect(entity.toJSON()).toEqual(
            new Genre({
                genreId: new GenreId(genreId),
                name: 'Test',
                categoriesId: new Map([
                    [category1.categoryId.value, category1.categoryId],
                    [category2.categoryId.value, category2.categoryId],
                ]),
                createdAt,
            }).toJSON(),
        );
    });

    test('Deve converter um entity para model using categoriesID', async () => {
        const category1 = Category.fake().aCategory().build();
        const category2 = Category.fake().aCategory().build();
        await categoryRepository.bulkInsert([category1, category2]);
        const genre = Genre.create({
            name: 'Test',
            categoriesId: [category1.categoryId, category2.categoryId],
        });

        const model = GenreModelMapper.toModel(genre);

        expect(model).toMatchObject({
            genreId: genre.genreId.value,
            name: genre.name,
            createdAt: genre.createdAt,
        });
        expect(model!.categoriesId).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    categoryId: category1.categoryId.value,
                }),
                expect.objectContaining({
                    categoryId: category2.categoryId.value,
                }),
            ]),
        );
    });
});
