import { CategoryId } from '@core/category/domain/category.aggregate';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import { CategoryNotFoundError } from '@core/category/domain/errors/catagory-not-found.error';
import { Either } from '@core/shared/domain/either';
import ICategoryIdsExistsInDatabaseValidation from './categories-ids-exists-in-database.interface';

export default class CategoriesIdsExistsInDatabaseValidation
    implements ICategoryIdsExistsInDatabaseValidation
{
    constructor(private readonly categoryRepository: ICategoryRepository) {}

    async validate(ids: string[]) {
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
