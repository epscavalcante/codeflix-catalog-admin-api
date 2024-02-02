import GenreMemoryRepository from '@core/genre/infra/repositories/genre-memory.repository';
import DeleteGenreUseCase from '../use-cases/delete-genre.use-case';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';
import GenreId from '@core/genre/domain/genre.id.vo';
import { GenreNotFoundError } from '@core/genre/domain/errors/genre-not-found.error';
import Genre from '@core/genre/domain/genre.aggregate';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';
import MemoryUnitOfWorkRepository from '@core/shared/infra/repositories/memory-unit-of-work.repository';

describe('Delete Category UseCase Unit Test', () => {
    let unitOfWork: IUnitOfWork;
    let repository: GenreMemoryRepository;
    let useCase: DeleteGenreUseCase;

    beforeEach(() => {
        unitOfWork = new MemoryUnitOfWorkRepository();
        repository = new GenreMemoryRepository();
        useCase = new DeleteGenreUseCase(unitOfWork, repository);
    });

    test('Deve lançar InvalidUuidExeception com id fake', async () => {
        await expect(() => useCase.handle({ id: 'fake' })).rejects.toThrow(
            new InvalidUuidException(),
        );
    });

    test('Deve lançar EntiityNotFoundExeception pq castMember não foi encontrada.', async () => {
        const uuid = new GenreId();

        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(
            new GenreNotFoundError(uuid.value),
        );
    });

    test('Deve deletar uma gênero', async () => {
        const spyDelete = jest.spyOn(repository, 'delete');
        const genre = Genre.fake().aGenre().build();
        repository.insert(genre);

        await repository.delete(genre.genreId);

        expect(spyDelete).toHaveBeenCalledTimes(1);
        expect(repository.items).toHaveLength(0);
    });
});
