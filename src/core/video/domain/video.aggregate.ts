import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import Uuid from '../../shared/domain/value-objects/uuid.vo';
import { CategoryId } from '@core/category/domain/category.aggregate';
import GenreId from '@core/genre/domain/genre.id.vo';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import Rating from './video-rating.vo';
import VideoBanner from './video-banner.vo';
import VideoThumbnailHalf from './video-thumbnail-half.vo';
import VideoThumbnail from './video-thumbnail.vo';
import VideoTrailer from './video-trailer.vo';
import VideoMedia from './video-media.vo';
import VideoValidator from './video.validator';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import AudioVideoMediaUpdatedEvent from './events/audio-video-media.updated.event';
import { VideoCreatedEvent } from './events/video-created.event';
import VideoFactory from './video.factory';

export class VideoId extends Uuid {}

export default class Video extends AggregateRoot {
    videoId: VideoId;
    title: string;
    description: string;
    yearLaunched: number;
    duration: number;
    rating: Rating;
    isOpened: boolean;
    isPublished: boolean;
    categoriesId: Map<string, CategoryId>;
    genresId: Map<string, GenreId>;
    castMembersId: Map<string, CastMemberId>;
    banner?: VideoBanner | null;
    thumbnail?: VideoThumbnail | null;
    thumbnailHalf?: VideoThumbnailHalf | null;
    trailer?: VideoTrailer | null;
    video?: VideoMedia | null;
    createdAt: Date;

    constructor(props: VideoConstructorProps) {
        super();
        this.videoId = props.videoId ?? new VideoId();
        this.title = props.title;
        this.description = props.description;
        this.yearLaunched = props.yearLaunched;
        this.duration = props.duration;
        this.rating = props.rating;
        this.isOpened = props.isOpened;
        this.isPublished = props.isPublished;
        this.categoriesId = props.categoriesId;
        this.genresId = props.genresId;
        this.castMembersId = props.castMembersId;

        this.banner = props?.banner ?? null;
        this.thumbnail = props?.thumbnail ?? null;
        this.thumbnailHalf = props?.thumbnailHalf ?? null;
        this.trailer = props.trailer ?? null;
        this.video = props.video ?? null;

        this.createdAt = props.createdAt ?? new Date();

        this.registerHandler(
            AudioVideoMediaUpdatedEvent.name,
            this.onAudioVideoMediaUpdated.bind(this),
        );

        this.registerHandler(
            VideoCreatedEvent.name,
            this.onAudioVideoMediaUpdated.bind(this),
        );
    }

    static create(props: VideoCreateCommandProps): Video {
        const video = new Video({
            ...props,
            isPublished: false,
            castMembersId: new Map(
                props.castMembersId.map((castMemberId) => [
                    castMemberId.value,
                    castMemberId,
                ]),
            ),
            categoriesId: new Map(
                props.categoriesId.map((categoryId) => [
                    categoryId.value,
                    categoryId,
                ]),
            ),
            genresId: new Map(
                props.genresId.map((genreId) => [genreId.value, genreId]),
            ),
        });

        video.validate(['title']);
        video.applyEvent(
            new VideoCreatedEvent({
                id: video.videoId,
                title: video.title,
                description: video.description,
                yearLaunched: video.yearLaunched,
                duration: video.duration,
                rating: video.rating,
                isOpened: video.isOpened,
                isPublished: video.isPublished,
                banner: video.banner ?? null,
                thumbnail: video.thumbnail ?? null,
                thumbnailHalf: video.thumbnailHalf ?? null,
                trailer: video.trailer ?? null,
                video: video.video ?? null,
                castMembersId: Array.from(video.castMembersId.values()),
                categoriesId: Array.from(video.categoriesId.values()),
                genresId: Array.from(video.genresId.values()),
                createdAt: video.createdAt,
            }),
        );

        return video;
    }

    validate(fields?: string[]) {
        const videoValidator = new VideoValidator();

        return videoValidator.validate(this.notification, this, fields);
    }

    static fake() {
        return VideoFactory;
    }

    changeTitle(title: string): void {
        this.title = title;

        this.validate(['title']);
    }

    changeDescription(description: string): void {
        this.description = description;
    }

    changeDuration(duration: number): void {
        this.duration = duration;
    }

    changeYearLauched(duration: number): void {
        this.duration = duration;
    }

    changeRating(rating: Rating): void {
        this.rating = rating;
    }
    changeBanner(banner: VideoBanner) {
        this.banner = banner;
    }

    changeThumbnail(thumbnail: VideoThumbnail) {
        this.thumbnail = thumbnail;
    }

    changeThumbnailHalf(thumbnailHalf: VideoThumbnailHalf) {
        this.thumbnailHalf = thumbnailHalf;
    }

    changeTrailer(trailer: VideoTrailer) {
        this.trailer = trailer;
    }

    changeVideo(video: VideoMedia) {
        this.video = video;
    }

    markAsOpened() {
        this.isOpened = true;
    }

    markAsNotOpened() {
        this.isOpened = false;
    }

    addCategoryId(categoryId: CategoryId) {
        this.categoriesId.set(categoryId.value, categoryId);
    }

    removeCategoryId(categoryId: CategoryId) {
        this.categoriesId.delete(categoryId.value);
    }

    syncCategoriesId(categoriesId: CategoryId[]) {
        if (!categoriesId.length) throw new Error('CategoriesId is not empty');
        this.categoriesId = new Map(
            categoriesId.map((categoryId) => [categoryId.value, categoryId]),
        );
    }

    addGenreId(genreId: GenreId) {
        this.genresId.set(genreId.value, genreId);
    }

    removeGenreId(genreId: GenreId) {
        this.genresId.delete(genreId.value);
    }

    syncGenresId(genresId: GenreId[]) {
        if (!genresId.length) throw new Error('GenresId is not empty');
        this.genresId = new Map(
            genresId.map((genreId) => [genreId.value, genreId]),
        );
    }

    addCastMemberId(castMemberId: CastMemberId) {
        this.castMembersId.set(castMemberId.value, castMemberId);
    }

    removeCastMemberId(castMemberId: CastMemberId) {
        this.castMembersId.delete(castMemberId.value);
    }

    syncCastMembersId(castMembersId: CastMemberId[]) {
        if (!castMembersId.length)
            throw new Error('CastMembersId is not empty');
        this.castMembersId = new Map(
            castMembersId.map((castMemberId) => [
                castMemberId.value,
                castMemberId,
            ]),
        );
    }

    onAudioVideoMediaUpdated() {
        if (this.isPublished) return;

        this.markAsPublished();
    }

    private markAsPublished() {
        if (
            this.trailer &&
            this.video &&
            this.video.status === AudioVideoMediaStatus.COMPLETED &&
            this.trailer.status === AudioVideoMediaStatus.COMPLETED
        )
            this.isPublished = true;
    }

    toJSON() {
        return {
            videoId: this.videoId.value,
            title: this.title,
            description: this.description,
            duration: this.description,
            yearLaunched: this.yearLaunched,
            isOpened: this.isOpened,
            isPublished: this.isPublished,
            categoriesId: Array.from(this.categoriesId.values()).map(
                (categoryId) => categoryId.value,
            ),
            genresId: Array.from(this.genresId.values()).map(
                (genreId) => genreId.value,
            ),
            castMembersId: Array.from(this.castMembersId.values()).map(
                (castMemberId) => castMemberId.value,
            ),
            banner: this.banner ? this.banner.toJson() : null,
            thumbnail: this.thumbnail ? this.thumbnail.toJson() : null,
            thumbnailHalf: this.thumbnailHalf
                ? this.thumbnailHalf.toJson()
                : null,
            trailer: this.trailer ? this.trailer.toJson() : null,
            video: this.video ? this.video.toJson() : null,
            createdAt: this.createdAt,
        };
    }

    get entityId(): VideoId {
        return this.videoId;
    }
}

export type VideoConstructorProps = {
    videoId?: VideoId;
    title: string;
    description: string;
    yearLaunched: number;
    duration: number;
    isOpened: boolean;
    isPublished: boolean;
    rating: Rating;

    banner?: VideoBanner;
    thumbnail?: VideoThumbnail;
    thumbnailHalf?: VideoThumbnailHalf;
    trailer?: VideoTrailer;
    video?: VideoMedia;

    categoriesId: Map<string, CategoryId>;
    genresId: Map<string, GenreId>;
    castMembersId: Map<string, CastMemberId>;
    createdAt?: Date;
};

export type VideoCreateCommandProps = {
    title: string;
    description: string;
    yearLaunched: number;
    duration: number;
    isOpened: boolean;
    rating: Rating;

    banner?: VideoBanner;
    thumbnail?: VideoThumbnail;
    thumbnailHalf?: VideoThumbnailHalf;
    trailer?: VideoTrailer;
    video?: VideoMedia;

    categoriesId: CategoryId[];
    genresId: GenreId[];
    castMembersId: CastMemberId[];
};
