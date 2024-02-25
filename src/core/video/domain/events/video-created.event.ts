import { CategoryId } from '@core/category/domain/category.aggregate';
import VideoBanner from '../video-banner.vo';
import Rating from '../video-rating.vo';
import VideoThumbnailHalf from '../video-thumbnail-half.vo';
import VideoThumbnail from '../video-thumbnail.vo';
import VideoTrailer from '../video-trailer.vo';
import { VideoId } from '../video.aggregate';
import GenreId from '@core/genre/domain/genre.id.vo';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import VideoMedia from '../video-media.vo';
import IDomainEvent from '@core/shared/domain/domain-events/domain-event.interface';

export type VideoCreatedEventProps = {
    id: VideoId;
    title: string;
    description: string;
    yearLaunched: number;
    duration: number;
    rating: Rating;
    isOpened: boolean;
    isPublished: boolean;
    banner: VideoBanner | null;
    thumbnail: VideoThumbnail | null;
    thumbnailHalf: VideoThumbnailHalf | null;
    trailer: VideoTrailer | null;
    video: VideoMedia | null;
    categoriesId: CategoryId[];
    genresId: GenreId[];
    castMembersId: CastMemberId[];
    createdAt: Date;
};

export class VideoCreatedEvent implements IDomainEvent {
    readonly identifier: VideoId;
    readonly occurredOn: Date;
    readonly eventVersion: number;

    readonly title: string;
    readonly description: string;
    readonly yearLaunched: number;
    readonly duration: number;
    readonly rating: Rating;
    readonly isOpened: boolean;
    readonly isPublished: boolean;
    readonly banner: VideoBanner | null;
    readonly thumbnail: VideoThumbnail | null;
    readonly thumbnailHalf: VideoThumbnailHalf | null;
    readonly trailer: VideoTrailer | null;
    readonly video: VideoMedia | null;
    readonly categoriesId: CategoryId[];
    readonly genresId: GenreId[];
    readonly castMembersId: CastMemberId[];
    readonly createdAt: Date;

    constructor(props: VideoCreatedEventProps) {
        this.identifier = props.id;
        this.title = props.title;
        this.description = props.description;
        this.yearLaunched = props.yearLaunched;
        this.duration = props.duration;
        this.rating = props.rating;
        this.isOpened = props.isOpened;
        this.isPublished = props.isPublished;
        this.banner = props.banner;
        this.thumbnail = props.thumbnail;
        this.thumbnailHalf = props.thumbnailHalf;
        this.trailer = props.trailer;
        this.video = props.video;
        this.categoriesId = props.categoriesId;
        this.genresId = props.genresId;
        this.castMembersId = props.castMembersId;
        this.createdAt = props.createdAt;
        this.occurredOn = new Date();
        this.eventVersion = 1;
    }
}
