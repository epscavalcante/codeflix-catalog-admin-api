import { CategoryId } from '@core/category/domain/category.aggregate';
import { CategoryNotFoundError } from '@core/category/domain/errors/catagory-not-found.error';
import IExistsInDatabaseValidation from '@core/shared/application/validations/exists-in-database.interface';

export default interface ICategoryIdsExistsInDatabaseValidation
    extends IExistsInDatabaseValidation<CategoryId, CategoryNotFoundError> {}
