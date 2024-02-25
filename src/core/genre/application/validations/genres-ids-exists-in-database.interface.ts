import { GenreNotFoundError } from '@core/genre/domain/errors/genre-not-found.error';
import GenreId from '@core/genre/domain/genre.id.vo';
import IExistsInDatabaseValidation from '@core/shared/application/validations/exists-in-database.interface';

export default interface IGenresIdExistsInDatabaseValidation
    extends IExistsInDatabaseValidation<GenreId, GenreNotFoundError> {}
