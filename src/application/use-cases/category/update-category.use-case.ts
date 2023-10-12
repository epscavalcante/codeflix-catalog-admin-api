import ICategoryRepository from "../../../domain/repositories/category.repository";
import Category from "../../../domain/entities/category.entity";
import IUseCase from "../use-case";
import Uuid from "../../../domain/value-objects/uuid.vo";
import EntityNotFoundException from "../../../domain/exceptions/entity-not-found.exception";
import CategoryOutput, { CategoryOutputType } from "../mappers/category-output";

export default class UpdateCategoryUseCase
    implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput>
{
    constructor(private readonly repository: ICategoryRepository) {}

    async handle(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
        const category = await this.repository.findById(new Uuid(input.id));

        if (!category) throw new EntityNotFoundException(input.id, Category);

        input.name && category.changeName(input.name);

        if (input.isActive === true) {
            category.activate();
        }

        if (input.isActive === false) {
            category.deactivate();
        }

        if ("description" in input) {
            category.changeDescription(input.description);
        }

        await this.repository.update(category);

        return CategoryOutput.toOutput(category);
    }
}

export type UpdateCategoryInput = {
    id: string;
    name?: string;
    description?: string | null;
    isActive?: boolean;
};

export type UpdateCategoryOutput = CategoryOutputType;
