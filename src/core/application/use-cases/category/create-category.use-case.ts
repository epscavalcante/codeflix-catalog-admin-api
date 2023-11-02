import ICategoryRepository from "../../../domain/repositories/category.repository";
import Category from "../../../domain/entities/category.entity";
import IUseCase from "../use-case";
import CategoryOutput, { CategoryOutputType } from "../mappers/category-output";
import EntityValidationException from "../../../domain/exceptions/entity-validation-error.exception";
import { CreateCategoryInput } from "./create-category-input.use-case";

export default class CreateCategoryUseCase
    implements IUseCase<CreateCategoryInput, CreateCategoryOutput>
{
    constructor(private readonly repository: ICategoryRepository) {}

    async handle(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
        const category = Category.create(input);

        if (category.notification.hasErrors()) {
            throw new EntityValidationException(category.notification.toJSON());
        }

        await this.repository.insert(category);

        return CategoryOutput.toOutput(category);
    }
}

export type CreateCategoryOutput = CategoryOutputType;
