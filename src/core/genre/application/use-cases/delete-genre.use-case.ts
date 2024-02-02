import GenreId from '@core/genre/domain/genre.id.vo';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';

export default class DeleteGenreUseCase
    implements IUseCase<DeleteGenreInput, DeleteGenreOutput>
{
    constructor(
        private readonly unitOfWork: IUnitOfWork,
        private readonly repository: IGenreRepository,
    ) {}

    async handle(input: DeleteGenreInput): Promise<DeleteGenreOutput> {
        return this.unitOfWork.execute(async () => {
            return this.repository.delete(new GenreId(input.id));
        });
    }
}

export type DeleteGenreInput = {
    id: string;
};

export type DeleteGenreOutput = void;
