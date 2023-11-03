import ICategoryRepository from "../../../domain/repositories/category.repository.interface";
import Category, { CategoryId } from "@core/domain/entities/category.aggregate";
import IUseCase from "../use-case.interface";
import EntityNotFoundException from "../../../domain/exceptions/entity-not-found.exception";
import CategoryOutput, { CategoryOutputType } from "../mappers/category-output";

export default class FindCategoryUseCase
    implements IUseCase<FindCategoryInput, FindCategoryOutput>
{
    constructor(private readonly repository: ICategoryRepository) {}

    async handle(input: FindCategoryInput): Promise<FindCategoryOutput> {
        const id = new CategoryId(input.id);
        const categoryFound = await this.repository.findById(id);

        if (!categoryFound)
            throw new EntityNotFoundException(id.value, Category);

        return CategoryOutput.toOutput(categoryFound);
    }
}

export type FindCategoryInput = {
    id: string;
};

export type FindCategoryOutput = CategoryOutputType;
