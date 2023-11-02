import CategorySequelizeRepository from "../repositories/category-sequelize.repository";
import CategoryModel from "../models/sequelize/category.model";
import Uuid from "../../domain/value-objects/uuid.vo";
import CategoryMapper from "./category.mapper";
import EntityValidationException from "../../domain/exceptions/entity-validation-error.exception";
import Category from "../../domain/entities/category.entity";
import { setupDatabase } from "../helpers/setup-database";

describe('Category Mapper Integration Tests', () => {
    let repository: CategorySequelizeRepository;

    setupDatabase({ models:  [CategoryModel] });

    beforeEach(async () => {
        repository = new CategorySequelizeRepository(CategoryModel);
    });

    describe('Category map Model to Entity', () => {
        test('Should receives entity validation exception', () => {
            const categoryModel = CategoryModel.build({
                categoryId: (new Uuid()).value,
                name: 'a'.repeat(256)
            });
    
            try {
                CategoryMapper.toEntity(categoryModel);
                fail('Category is valid, but needs throws exception');
            } catch (error) {
                expect(error).toBeInstanceOf(EntityValidationException);
                expect((error as EntityValidationException).error).toMatchObject([
                    {
                        name: [
                            'name must be shorter than or equal to 255 characters',
                        ]
                    }
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
                createdAt: category.createdAt
            });
    
            const categoryEntityMapped = CategoryMapper.toEntity(categoryModel);
    
            expect(categoryEntityMapped.toJSON()).toStrictEqual(category.toJSON());
        });
    })

    describe('Category entity to Model', () => {
        test('Map entity to Model', () => {
            const category = Category.fake().aCategory().build();

            const categoryModelMapped = CategoryMapper.toModel(category);
            
            expect(categoryModelMapped.toJSON()).toStrictEqual({
                categoryId: category.categoryId.value,
                name: category.name,
                description: category.description,
                isActive: category.isActive,
                createdAt: category.createdAt
            });
        })
    });
})