import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import VideoUseCaseMapper, { VideoOutputType } from '../video.usecase.mapper';
import PaginationOutput, {
    PaginationOutputType,
} from '@core/shared/application/use-cases/mappers/pagination-output';
import IVideoRepository, {
    VideoSearchParams,
} from '@core/video/domain/video.repository.interface';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import { ListVideoInput } from './list-video.use-case.input';
import GenreId from '@core/genre/domain/genre.id.vo';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';

export default class ListVideoUseCase
    implements IUseCase<ListVideoInput, ListVideoOutputType>
{
    constructor(
        private readonly videoRepository: IVideoRepository,
        private readonly genreRepository: IGenreRepository,
        private readonly categoryRepository: ICategoryRepository,
        private readonly castMemberRepository: ICastMemberRepository,
    ) {}

    async handle(input: ListVideoInput): Promise<ListVideoOutputType> {
        const params = VideoSearchParams.create({
            page: input?.page,
            perPage: input?.perPage,
            sort: input?.sort,
            sortDir: input?.sortDir,
            filter: {
                title: input?.filter?.title,
                genresId: input?.filter?.genresId,
                categoriesId: input?.filter?.categoriesId,
                castMembersId: input?.filter?.castMembersId,
            },
        });
        const searchResult = await this.videoRepository.search(params);

        const { items: _items } = searchResult;

        const genresIdRelated = searchResult.items.reduce<GenreId[]>(
            (acc, item) => acc.concat([...item.genresId.values()]),
            [],
        );
        const genresRelated =
            await this.genreRepository.findByIds(genresIdRelated);

        const categoriesIdRelated = searchResult.items.reduce<CategoryId[]>(
            (acc, item) => {
                const categoriesIdFromGenres = [
                    ...genresRelated.map((genre) =>
                        Array.from(genre.categoriesId.values()),
                    ),
                ];
                return acc.concat(
                    [...item.categoriesId.values()],
                    ...categoriesIdFromGenres,
                );
            },
            [],
        );

        const categoriesRelated =
            await this.categoryRepository.findByIds(categoriesIdRelated);

        const castMembersIdRelated = searchResult.items.reduce<CastMemberId[]>(
            (acc, item) => acc.concat([...item.castMembersId.values()]),
            [],
        );

        const castMembersRelated =
            await this.castMemberRepository.findByIds(castMembersIdRelated);

        const items = _items.map((video) => {
            return VideoUseCaseMapper.toOutput(video, {
                genres: genresRelated.filter((genreRelated) =>
                    video.genresId.has(genreRelated.genreId.value),
                ),
                categories: categoriesRelated.filter((categoryRelated) => {
                    return (
                        video.categoriesId.has(
                            categoryRelated.categoryId.value,
                        ) ||
                        genresRelated.some((genre) =>
                            genre.categoriesId.has(
                                categoryRelated.categoryId.value,
                            ),
                        )
                    );
                }),
                castMembers: castMembersRelated.filter((castMemberRelated) =>
                    video.castMembersId.has(
                        castMemberRelated.castMemberId.value,
                    ),
                ),
            });
        });

        return PaginationOutput.toOutput(items, searchResult);
    }
}

export type ListVideoOutputType = PaginationOutputType<VideoOutputType>;
