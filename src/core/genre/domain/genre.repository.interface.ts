import ISearchableRepository, {
    SearchParams,
    SearchParamsConstructorProps,
    SearchResult,
} from '@core/shared/domain/repositories/searchable.repository.interface';
import Genre from './genre.aggregate';
import GenreId from './genre.id.vo';
import { CategoryId } from '@core/category/domain/category.aggregate';

export type GenreFilter = {
    name?: string | null;
    categoriesId?: CategoryId[];
};

export class GenreSearchParams extends SearchParams<GenreFilter> {
    constructor(props: SearchParamsConstructorProps<GenreFilter> = {}) {
        super(props);
    }

    static create(
        props: Omit<SearchParamsConstructorProps<GenreFilter>, 'filter'> & {
            filter?: {
                name?: string;
                categoriesId?: CategoryId[] | string[];
            };
        } = {},
    ) {
        const categoriesId = props.filter?.categoriesId?.map((categoryId) => {
            return categoryId instanceof CategoryId
                ? categoryId
                : new CategoryId(categoryId);
        });

        return new GenreSearchParams({
            ...props,
            filter: {
                name: props.filter?.name,
                categoriesId,
            },
        });
    }

    protected set filter(value: GenreFilter | null) {
        const _value =
            !value || (value as unknown) === '' || typeof value !== 'object'
                ? null
                : value;
        const filter = {
            ...(_value?.name && { name: `${_value.name}` }),
            ...(_value?.categoriesId &&
                _value?.categoriesId.length && {
                    categoriesId: _value.categoriesId,
                }),
        };

        this._filter = Object.keys(filter).length ? filter : null;
    }

    get filter(): GenreFilter | null {
        return this._filter as GenreFilter | null;
    }
}

export class GenreSearchResult extends SearchResult<Genre> {}

export default interface IGenreRepository
    extends ISearchableRepository<
        Genre,
        GenreId,
        GenreFilter,
        GenreSearchParams,
        GenreSearchResult
    > {
    findByIds(genresIds: GenreId[]): Promise<Genre[]>;
    existsByIds(genresIds: GenreId[]): Promise<{
        exists: GenreId[];
        notExists: GenreId[];
    }>;
}
