import ICategoryRepository from '@core/category/domain/category.repository.interface';
import Category from '@core/category/domain/category.aggregate';
import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import CategoryOutput, { CategoryOutputType } from './mappers/category-output';
import {
    CreateCategoryInput,
    CreateCategoryInputProps,
} from './mappers/create-category-input.use-case';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';

export default class CreateCategoryUseCase
    implements IUseCase<CreateCategoryInput, CreateCategoryOutput>
{
    constructor(private readonly repository: ICategoryRepository) {}

    async handle(
        input: CreateCategoryInputProps,
    ): Promise<CreateCategoryOutput> {
        const category = Category.create(input);

        if (category.notification.hasErrors()) {
            throw new EntityValidationError(category.notification.toJSON());
        }

        await this.repository.insert(category);

        return CategoryOutput.toOutput(category);
    }
}

export type CreateCategoryOutput = CategoryOutputType;
