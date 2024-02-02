import { GenreNotFoundError } from '@core/genre/domain/errors/genre-not-found.error';
import GenreId from '@core/genre/domain/genre.id.vo';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import { Either } from '@core/shared/domain/either';

export default class GenresIdsExistsInDatabaseValidation {
    constructor(private readonly repository: IGenreRepository) {}

    async validate(
        ids: string[],
    ): Promise<Either<GenreId[] | null, GenreNotFoundError[] | null>> {
        const genresId = ids.map((id) => new GenreId(id));

        const result = await this.repository.existsByIds(genresId);

        return result.notExists.length > 0
            ? Either.fail(
                  result.notExists.map(
                      (item) => new GenreNotFoundError(item.value),
                  ),
              )
            : Either.ok(genresId);
    }
}
