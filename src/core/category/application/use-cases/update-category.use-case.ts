import ICategoryRepository from '@core/category/domain/category.repository.interface';
import Category, { CategoryId } from '@core/category/domain/category.aggregate';
import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import EntityNotFoundException from '@core/shared/domain/exceptions/entity-not-found.exception';
import CategoryOutput, { CategoryOutputType } from './mappers/category-output';
import EntityValidationException from '@core/shared/domain/exceptions/entity-validation-error.exception';
import { UpdateCategoryInput } from './mappers/update-category-input.use-case';

export default class UpdateCategoryUseCase
    implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput>
{
    constructor(private readonly repository: ICategoryRepository) {}

    async handle(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
        const category = await this.repository.findById(
            new CategoryId(input.id),
        );

        if (!category) throw new EntityNotFoundException(input.id, Category);

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
            throw new EntityValidationException(category.notification.toJSON());
        }

        await this.repository.update(category);

        return CategoryOutput.toOutput(category);
    }
}

export type UpdateCategoryOutput = CategoryOutputType;
