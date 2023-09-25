import Uuid from "../../../domain/value-objects/uuid.vo";
import Category from "../../../domain/entities/category.entity";
import CategoryModel from "../sequelize/category.sequelize";
import EntityValidationError from "domain/exceptions/entity-validation-error.exception";

export default class CategoryMapper {
    static toModel(category: Category): CategoryModel {
        return CategoryModel.build({
            categoryId: category.categoryId.value,
            name: category.name,
            description: category.description,
            isActive: category.isActive,
            createdAt: category.createdAt,
        });
    }

    static toEntity(model: CategoryModel): Category {
        const category = new Category({
            categoryId: new Uuid(model.categoryId),
            name: model.name,
            description: model.description,
            isActive: model.isActive,
            createdAt: model.createdAt,
        });

        Category.validate(category);

        return category;
    }
}
