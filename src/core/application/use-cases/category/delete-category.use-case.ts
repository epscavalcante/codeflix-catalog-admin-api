import ICategoryRepository from "../../../domain/repositories/category.repository.interface";
import Category from "../../../domain/entities/category.entity";
import IUseCase from "../use-case.interface";
import Uuid from "../../../domain/value-objects/uuid.vo";
import EntityNotFoundException from "../../../domain/exceptions/entity-not-found.exception";

export default class DeleteCategoryUseCase
    implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
    constructor(private readonly repository: ICategoryRepository) {}

    async handle(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
        await this.repository.delete(new Uuid(input.id));
    }
}

export type DeleteCategoryInput = {
    id: string;
};

export type DeleteCategoryOutput = void;
