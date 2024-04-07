import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import CategoryMapper from '@core/category/infra/database/sequelize/mappers/category.mapper';
import Category, { CategoryId } from '@core/category/domain/category.aggregate';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';

describe('Category Mapper Integration Tests', () => {
    setupDatabase({ models: [CategoryModel] });

    describe('Category map Model to Entity', () => {
        test('Should receives entity validation exception', () => {
            const categoryModel = CategoryModel.build({
                categoryId: new CategoryId().value,
                name: 'a'.repeat(256),
                isActive: false,
                createdAt: new Date(),
            });

            try {
                CategoryMapper.toEntity(categoryModel);
                fail('Category is valid, but needs throws exception');
            } catch (error) {
                expect(error).toBeInstanceOf(EntityValidationError);
                expect((error as EntityValidationError).error).toMatchObject([
                    {
                        name: [
                            'name must be shorter than or equal to 255 characters',
                        ],
                    },
                ]);
            }
        });

        test('Should mapper model to entity', () => {
            const category = Category.fake().aCategory().build();

            const categoryModel = CategoryModel.build({
                categoryId: category.categoryId.value,
                name: category.name,
                description: category.description,
                isActive: category.isActive,
                createdAt: category.createdAt,
            });

            const categoryEntityMapped = CategoryMapper.toEntity(categoryModel);

            expect(categoryEntityMapped.toJSON()).toStrictEqual(
                category.toJSON(),
            );
        });
    });

    describe('Category entity to Model', () => {
        test('Map entity to Model', () => {
            const category = Category.fake().aCategory().build();

            const categoryModelMapped = CategoryMapper.toModel(category);

            expect(categoryModelMapped.toJSON()).toStrictEqual({
                categoryId: category.categoryId.value,
                name: category.name,
                description: category.description,
                isActive: category.isActive,
                createdAt: category.createdAt,
            });
        });
    });
});
