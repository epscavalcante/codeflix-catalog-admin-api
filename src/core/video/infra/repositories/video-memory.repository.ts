import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';
import { SearchableMemoryRepository } from '@core/shared/infra/repositories/searchable-memory.repository';
import IVideoRepository, {
    VideoFilter,
} from '@core/video/domain/video.repository.interface';
import Video, { VideoId } from '@core/video/domain/video.aggregate';

export default class VideoMemoryRepository
    extends SearchableMemoryRepository<Video, VideoId, VideoFilter>
    implements IVideoRepository
{
    sortableFields: string[] = ['title', 'createdAt'];

    getEntity(): new (...args: any[]) => Video {
        return Video;
    }

    async applyFilter(items: Video[], filter: VideoFilter): Promise<Video[]> {
        if (!filter) return items;

        return items.filter((genre) => {
            const containsTitle =
                filter.title &&
                genre.title.toLowerCase().includes(filter.title!.toLowerCase());
            const containsCategoriesId =
                filter.categoriesId &&
                filter.categoriesId.some((categoryId) =>
                    genre.categoriesId.has(categoryId.value),
                );
            const containsGenresId =
                filter.genresId &&
                filter.genresId.some((genreId) =>
                    genre.genresId.has(genreId.value),
                );

            const containsCastMembersId =
                filter.castMembersId &&
                filter.castMembersId.some((castMemberId) =>
                    genre.castMembersId.has(castMemberId.value),
                );

            const filterMap = [
                [filter.title, containsTitle],
                [filter.categoriesId, containsCategoriesId],
                [filter.genresId, containsGenresId],
                [filter.castMembersId, containsCastMembersId],
            ].filter((f) => f[0]);

            return filterMap.every((f) => f[1]);
        });
    }

    protected applySorting(
        items: Video[],
        sort: string | null,
        sortDir: SortDirection | null,
    ): Video[] {
        return sort
            ? super.applySorting(items, sort, sortDir)
            : super.applySorting(items, 'createdAt', 'desc');
    }

    // async findByIds(ids: VideoId[]): Promise<Video[]> {
    //     //avoid to return repeated items
    //     return this.items.filter((entity) => {
    //         return ids.some((id) => entity.videoId.equals(id));
    //     });
    // }

    // async existsByIds(
    //     ids: GenreId[],
    // ): Promise<{ exists: GenreId[]; notExists: GenreId[] }> {
    //     if (this.items.length === 0) {
    //         return {
    //             exists: [],
    //             notExists: ids,
    //         };
    //     }

    //     const existsId = new Set<GenreId>();
    //     const notExistsId = new Set<GenreId>();
    //     ids.forEach((id) => {
    //         const item = this.items.find((entity) => entity.genreId.equals(id));
    //         item ? existsId.add(id) : notExistsId.add(id);
    //     });
    //     return {
    //         exists: Array.from(existsId.values()),
    //         notExists: Array.from(notExistsId.values()),
    //     };
    // }
}
