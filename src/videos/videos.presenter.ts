import { Transform, Type } from 'class-transformer';
import CollectionPresenter from '../shared/presenters/collection.presenter';
import {
    VideoCastMemberOutputType,
    VideoCategoryOutputType,
    VideoGenreOutputType,
    VideoOutputType,
} from '@core/video/application/usecases/video.usecase.mapper';
import { ListVideoOutputType } from '@core/video/application/usecases/list/list-video.use-case';

export default class VideoPresenter {
    id: string;
    title: string;
    description: string;
    yearLaunched: number;
    duration: number;
    rating: string;
    isOpened: boolean;
    isPublished: boolean;
    banner: string | null;
    thumbnail: string | null;
    thumbnailHalf: string | null;
    // categoriesId: string[];
    @Type(() => VideoCastMemberPresenter)
    castMembers: VideoCastMemberPresenter[];
    @Type(() => VideoCategoryPresenter)
    categories: VideoCategoryPresenter[];
    @Type(() => VideoGenrePresenter)
    genres: VideoGenrePresenter[];
    // isActive: boolean;
    @Transform(({ value }: { value: Date }) => {
        return value.toISOString();
    })
    createdAt: Date;

    constructor(output: VideoOutputType) {
        this.id = output.id;
        this.title = output.title;
        this.description = output.description;
        this.yearLaunched = output.yearLaunched;
        this.duration = output.duration;
        this.rating = output.rating;
        this.isOpened = output.isOpened;
        this.isPublished = output.isPublished;
        this.banner = output.banner;
        this.thumbnail = output.thumbnail;
        this.thumbnailHalf = output.thumbnailHalf;
        this.categories = output.categories.map((item) => {
            return new VideoCategoryPresenter(item);
        });
        this.castMembers = output.castMembers.map((item) => {
            return new VideoCastMemberPresenter(item);
        });
        this.genres = output.genres.map((item) => {
            return new VideoGenrePresenter(item);
        });
        // this.isActive = output.isActive;
        this.createdAt = output.createdAt;
    }
}

export class VideoCategoryPresenter {
    id: string;
    name: string;
    isActive: boolean;
    //   @Transform(({ value }: { value: Date }) => {
    //     return value.toISOString();
    //   })
    //   created_at: Date;

    constructor(output: VideoCategoryOutputType) {
        this.id = output.id;
        this.name = output.name;
        this.isActive = output.isActive;
    }
}

export class VideoGenrePresenter {
    id: string;
    name: string;
    // isActive: boolean;
    //   @Transform(({ value }: { value: Date }) => {
    //     return value.toISOString();
    //   })
    //   created_at: Date;

    constructor(output: VideoGenreOutputType) {
        this.id = output.id;
        this.name = output.name;
        // this.isActive = output.isActive;
    }
}

export class VideoCastMemberPresenter {
    id: string;
    name: string;
    type: 1 | 2;
    //   @Transform(({ value }: { value: Date }) => {
    //     return value.toISOString();
    //   })
    //   created_at: Date;

    constructor(output: VideoCastMemberOutputType) {
        this.id = output.id;
        this.name = output.name;
        this.type = output.type;
    }
}

export class VideoCollectionPresenter extends CollectionPresenter {
    @Type(() => VideoPresenter)
    data: VideoPresenter[];

    constructor(output: ListVideoOutputType) {
        const { items, ...paginationProps } = output;
        super(paginationProps);
        this.data = items.map((item) => new VideoPresenter(item));
    }
}
