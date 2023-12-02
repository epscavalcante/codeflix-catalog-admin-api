import { CategoryId } from '@core/category/domain/category.aggregate';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import { CategoryNotFoundError } from '@core/category/domain/errors/catagory-not-found.error';
import { Either } from '@core/shared/domain/either';

export default class ExistsInDatabaseValidation {
    constructor(private readonly categoryRepository: ICategoryRepository) {}

    async validate(
        ids: string[],
    ): Promise<Either<CategoryId[] | null, CategoryNotFoundError[] | null>> {
        const categoriesId = ids.map((id) => new CategoryId(id));

        const result = await this.categoryRepository.existsByIds(categoriesId);

        return result.notExists.length > 0
            ? Either.fail(
                  result.notExists.map(
                      (item) => new CategoryNotFoundError(item.value),
                  ),
              )
            : Either.ok(categoriesId);
    }
}
