import Uuid from "../../domain/value-objects/uuid.vo";
import Category from "../../domain/entities/category.entity";
import EntityValidationError from "../../domain/exceptions/entity-validation-error.exception";
import CategoryModel from "../models/sequelize/category.model";

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

        category.validate();

        if (category.notification.hasErrors()) {
            throw new EntityValidationError(category.notification.toJSON());
        }

        return category;
    }
}
