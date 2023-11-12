import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import CategoryOutput, { CategoryOutputType } from './mappers/category-output';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import Category, { CategoryId } from '@core/category/domain/category.aggregate';
import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';

export default class FindCategoryUseCase
    implements IUseCase<FindCategoryInput, FindCategoryOutput>
{
    constructor(private readonly repository: ICategoryRepository) {}

    async handle(input: FindCategoryInput): Promise<FindCategoryOutput> {
        const id = new CategoryId(input.id);
        const categoryFound = await this.repository.findById(id);

        if (!categoryFound) throw new EntityNotFoundError(id.value, Category);

        return CategoryOutput.toOutput(categoryFound);
    }
}

export type FindCategoryInput = {
    id: string;
};

export type FindCategoryOutput = CategoryOutputType;
