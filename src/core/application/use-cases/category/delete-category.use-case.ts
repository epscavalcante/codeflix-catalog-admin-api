import ICategoryRepository from "@core/domain/repositories/category.repository.interface";
import { CategoryId } from "@core/domain/entities/category.aggregate";
import IUseCase from "../use-case.interface";

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
