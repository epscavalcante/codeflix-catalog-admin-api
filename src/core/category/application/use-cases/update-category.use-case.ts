import ICategoryRepository from '@core/category/domain/category.repository.interface';
import Category, { CategoryId } from '@core/category/domain/category.aggregate';
import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';
import CategoryOutput, { CategoryOutputType } from './mappers/category-output';
import { UpdateCategoryInput } from './mappers/update-category-input.use-case';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';

export default class UpdateCategoryUseCase
    implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput>
{
    constructor(private readonly repository: ICategoryRepository) {}

    async handle(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
        const category = await this.repository.findById(
            new CategoryId(input.id),
        );

        if (!category) throw new EntityNotFoundError(input.id, Category);

        input.name && category.changeName(input.name);

        if (input.isActive === true) {
            category.activate();
        }

        if (input.isActive === false) {
            category.deactivate();
        }

        if ('description' in input) {
            category.changeDescription(input.description!);
        }

        if (category.notification.hasErrors()) {
            throw new EntityValidationError(category.notification.toJSON());
        }

        await this.repository.update(category);

        return CategoryOutput.toOutput(category);
    }
}

export type UpdateCategoryOutput = CategoryOutputType;
