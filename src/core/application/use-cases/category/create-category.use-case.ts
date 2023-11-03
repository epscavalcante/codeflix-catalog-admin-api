import ICategoryRepository from "../../../domain/repositories/category.repository.interface";
import Category from "../../../domain/entities/category.aggregate";
import IUseCase from "../use-case.interface";
import CategoryOutput, { CategoryOutputType } from "../mappers/category-output";
import EntityValidationException from "../../../domain/exceptions/entity-validation-error.exception";
import { CreateCategoryInput } from "./create-category-input.use-case";

export default class CreateCategoryUseCase
    implements IUseCase<CreateCategoryInput, CreateCategoryOutput>
{
    constructor(private readonly repository: ICategoryRepository) {}

    async handle(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
        // @ts-ignore
        const category = Category.create(input);

        if (category.notification.hasErrors()) {
            throw new EntityValidationException(category.notification.toJSON());
        }

        await this.repository.insert(category);

        return CategoryOutput.toOutput(category);
    }
}

export type CreateCategoryOutput = CategoryOutputType;
