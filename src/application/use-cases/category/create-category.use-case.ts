import ICategoryRepository from "../../../domain/repositories/category.repository";
import Category from "../../../domain/entities/category.entity";
import IUseCase from "../use-case";
import CategoryOutput, { CategoryOutputType } from "../mappers/category-output";

export default class CreateCategoryUseCase
    implements IUseCase<CreateCategoryInput, CreateCategoryOutput>
{
    constructor(private readonly repository: ICategoryRepository) {}

    async handle(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
        const category = Category.create(input);

        await this.repository.insert(category);

        return CategoryOutput.toOutput(category);
    }
}

export type CreateCategoryInput = {
    name: string;
    description?: string | null;
    isActive?: boolean;
};

export type CreateCategoryOutput = CategoryOutputType;
