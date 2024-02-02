import { GenreNotFoundError } from '@core/genre/domain/errors/genre-not-found.error';
import GenreId from '@core/genre/domain/genre.id.vo';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import GenreOutputMapper, {
    GenreOutputType,
} from '../mappers/genre.use-case.output';
import ICategoryRepository from '@core/category/domain/category.repository.interface';

export default class FindGenreUseCase
    implements IUseCase<FindGenreInput, FindGenreOutput>
{
    constructor(
        private readonly genreRepository: IGenreRepository,
        private readonly categoryRepository: ICategoryRepository,
    ) {}

    async handle(input: FindGenreInput): Promise<FindGenreOutput> {
        const id = new GenreId(input.id);
        const genreFound = await this.genreRepository.findById(id);

        if (!genreFound) throw new GenreNotFoundError(id.value);

        const categoriesRelated = await this.categoryRepository.findByIds([
            ...genreFound.categoriesId.values(),
        ]);

        return GenreOutputMapper.toOutput(genreFound, categoriesRelated);
    }
}

export type FindGenreInput = {
    id: string;
};

export type FindGenreOutput = GenreOutputType;
