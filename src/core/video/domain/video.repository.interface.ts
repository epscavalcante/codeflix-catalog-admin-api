import ISearchableRepository, {
    SearchParams,
    SearchParamsConstructorProps,
    SearchResult,
} from '@core/shared/domain/repositories/searchable.repository.interface';
import { CategoryId } from '@core/category/domain/category.aggregate';
import GenreId from '@core/genre/domain/genre.id.vo';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import Video from './video.aggregate';

export type VideoFilter = {
    title?: string | null;
    categoriesId?: CategoryId[];
    genresId?: CategoryId[];
    castMembersId?: CategoryId[];
};

export class VideoSearchParams extends SearchParams<VideoFilter> {
    private constructor(props: SearchParamsConstructorProps<VideoFilter> = {}) {
        super(props);
    }

    static create(
        props: Omit<SearchParamsConstructorProps<VideoFilter>, 'filter'> & {
            filter?: {
                title?: string;
                categoriesId?: CategoryId[] | string[];
                genresId?: GenreId[] | string[];
                castMembersId?: CastMemberId[] | string[];
            };
        } = {},
    ) {
        const categoriesId = props.filter?.categoriesId?.map((categoryId) => {
            return categoryId instanceof CategoryId
                ? categoryId
                : new CategoryId(categoryId);
        });
        const genresId = props.filter?.genresId?.map((genreId) => {
            return genreId instanceof GenreId ? genreId : new GenreId(genreId);
        });
        const castMembersId = props.filter?.castMembersId?.map(
            (castMemberId) => {
                return castMemberId instanceof CastMemberId
                    ? castMemberId
                    : new CastMemberId(castMemberId);
            },
        );

        return new VideoSearchParams({
            ...props,
            filter: {
                title: props.filter?.title,
                categoriesId,
                genresId,
                castMembersId,
            },
        });
    }

    protected set filter(value: VideoFilter | null) {
        const _value =
            !value || (value as unknown) === '' || typeof value !== 'object'
                ? null
                : value;
        const filter = {
            ...(_value?.title && { title: `${_value.title}` }),
            ...(_value?.categoriesId &&
                _value?.categoriesId.length && {
                    categoriesId: _value.categoriesId,
                }),
            ...(_value?.genresId &&
                _value?.genresId.length && {
                    genresId: _value.genresId,
                }),
            ...(_value?.castMembersId &&
                _value?.castMembersId.length && {
                    castMembersId: _value.castMembersId,
                }),
        };

        this._filter = Object.keys(filter).length ? filter : null;
    }

    get filter(): VideoFilter | null {
        return this._filter as VideoFilter | null;
    }
}

export class VideoSearchResult extends SearchResult<Video> {}

export default interface IVideoRepository
    extends ISearchableRepository<
        Video,
        GenreId,
        VideoFilter,
        VideoSearchParams,
        VideoSearchResult
    > {
    // findByIds(genresIds: GenreId[]): Promise<Video[]>;
    // existsByIds(genresIds: GenreId[]): Promise<{
    //     exists: GenreId[];
    //     notExists: GenreId[];
    // }>;
}
