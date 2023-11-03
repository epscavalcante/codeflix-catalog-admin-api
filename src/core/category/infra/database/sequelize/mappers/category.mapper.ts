import Category, { CategoryId } from '@core/category/domain/category.aggregate';
import EntityValidationException from '@core/shared/domain/exceptions/entity-validation-error.exception';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';

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
            categoryId: new CategoryId(model.categoryId),
            name: model.name,
            description: model.description!,
            isActive: model.isActive,
            createdAt: model.createdAt,
        });

        category.validate();

        if (category.notification.hasErrors()) {
            throw new EntityValidationException(category.notification.toJSON());
        }

        return category;
    }
}
