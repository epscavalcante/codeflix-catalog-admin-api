import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';
import Category from '../category.aggregate';

export class CategoryNotFoundError extends EntityNotFoundError {
    constructor(id: string) {
        super(id, Category);
    }
}
