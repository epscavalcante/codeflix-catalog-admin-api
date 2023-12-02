import GenreId from '@core/genre/domain/genre.id.vo';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import IUseCase from '@core/shared/application/use-cases/use-case.interface';

export default class DeleteGenreUseCase
    implements IUseCase<DeleteGenreInput, DeleteGenreOutput>
{
    constructor(private readonly repository: IGenreRepository) {}

    async handle(
        input: DeleteGenreInput,
    ): Promise<DeleteGenreOutput> {
        await this.repository.delete(new GenreId(input.id));
    }
}

export type DeleteGenreInput = {
    id: string;
};

export type DeleteGenreOutput = void;
