import { CategoryId } from "@core/category/domain/category.aggregate";
import ICategoryRepository from "@core/category/domain/category.repository.interface";
import IUseCase from "@core/shared/application/use-cases/use-case.interface";

export default class DeleteCategoryUseCase
    implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
    constructor(private readonly repository: ICategoryRepository) {}

    async handle(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
        await this.repository.delete(new CategoryId(input.id));
    }
}

export type DeleteCategoryInput = {
    id: string;
};

export type DeleteCategoryOutput = void;
