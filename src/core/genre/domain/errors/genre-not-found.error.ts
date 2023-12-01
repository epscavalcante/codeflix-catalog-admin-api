import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';
import Genre from '../genre.aggregate';

export class GenreNotFoundError extends EntityNotFoundError {
    constructor(id: string) {
        super(id, Genre);
    }
}
