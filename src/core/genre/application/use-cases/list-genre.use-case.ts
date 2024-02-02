import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import { ListGenreInput } from '../mappers/list-genre.use-case.input';
import IGenreRepository, {
    GenreSearchParams,
    GenreSearchResult,
} from '@core/genre/domain/genre.repository.interface';
import PaginationOutput, {
    PaginationOutputType,
} from '@core/shared/application/use-cases/mappers/pagination-output';
import GenreOutputMapper, {
    GenreOutputType,
} from '../mappers/genre.use-case.output';
import { CategoryId } from '@core/category/domain/category.aggregate';
import ICategoryRepository from '@core/category/domain/category.repository.interface';

export default class ListGenreUseCase
    implements IUseCase<ListGenreInput, ListGenresOutput>
{
    constructor(
        private genreRepository: IGenreRepository,
        private categoryRepository: ICategoryRepository,
    ) {}

    async handle(input: ListGenreInput): Promise<ListGenresOutput> {
        const params = GenreSearchParams.create(input);
        const searchResult = await this.genreRepository.search(params);
        return this.toOutput(searchResult);
    }

    private async toOutput(
        searchResult: GenreSearchResult,
    ): Promise<ListGenresOutput> {
        const { items: _items } = searchResult;

        const categoriesIdRelated = searchResult.items.reduce<CategoryId[]>(
            (acc, item) => {
                return acc.concat([...item.categoriesId.values()]);
            },
            [],
        );

        const categoriesRelated =
            await this.categoryRepository.findByIds(categoriesIdRelated);

        const items = _items.map((genre) => {
            const categoriesOfGenre = categoriesRelated.filter(
                (categoryRelated) =>
                    genre.categoriesId.has(categoryRelated.categoryId.value),
            );

            return GenreOutputMapper.toOutput(genre, categoriesOfGenre);
        });

        return PaginationOutput.toOutput(items, searchResult);
    }
}

export type ListGenresOutput = PaginationOutputType<GenreOutputType>;
