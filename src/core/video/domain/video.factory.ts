import { Chance } from 'chance';
import Video, { VideoId } from './video.aggregate';
import Rating from './video-rating.vo';
import VideoBanner from './video-banner.vo';
import VideoThumbnail from './video-thumbnail.vo';
import VideoThumbnailHalf from './video-thumbnail-half.vo';
import VideoTrailer from './video-trailer.vo';
import VideoMedia from './video-media.vo';
import { CategoryId } from '@core/category/domain/category.aggregate';
import GenreId from '@core/genre/domain/genre.id.vo';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import ImageMedia from '@core/shared/domain/value-objects/image-media.vo';

type PropOrFactory<T> = T | ((index: number) => T);

export default class VideoFactory<TBuild = any> {
    // auto generated in entity
    private _videoId: PropOrFactory<VideoId> | undefined = undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _title: PropOrFactory<string> = (_index) =>
        this.chance.word({ length: 5 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _description: PropOrFactory<string> = (_index) =>
        this.chance.word();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _yearLaunched: PropOrFactory<number> = (_index) =>
        +this.chance.year();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _duration: PropOrFactory<number> = (_index) =>
        this.chance.integer({ min: 1, max: 100 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _rating: PropOrFactory<Rating> = (_index) => Rating.createRL();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _opened: PropOrFactory<boolean> = (_index) => true;
    private _banner: PropOrFactory<VideoBanner | null> | undefined =
        new VideoBanner({
            name: 'test-name-banner.png',
            location: 'test path banner',
        });
    private _thumbnail: PropOrFactory<VideoThumbnail | null> | undefined =
        new VideoThumbnail({
            name: 'test-name-thumbnail.png',
            location: 'test path thumbnail',
        });
    private _thumbnailHalf:
        | PropOrFactory<VideoThumbnailHalf | null>
        | undefined = new VideoThumbnailHalf({
        name: 'test-name-thumbnail-half.png',
        location: 'test path thumbnail half',
    });
    private _trailer: PropOrFactory<VideoTrailer | null> | undefined =
        VideoTrailer.create('test-name-trailer.mp4', 'test path trailer');
    private _video: PropOrFactory<VideoMedia | null> | undefined =
        VideoMedia.create('test-name-video.mp4', 'test path video');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _categoriesId: PropOrFactory<CategoryId>[] = [];
    private _genresId: PropOrFactory<GenreId>[] = [];
    private _castMembersId: PropOrFactory<CastMemberId>[] = [];

    // auto generated in entity
    private _createdAt: PropOrFactory<Date> | undefined = undefined;

    private countObjs;

    static aVideoWithoutMedias() {
        return new VideoFactory<Video>()
            .withoutVideoBanner()
            .withoutVideoThumbnail()
            .withoutVideoThumbnailHalf()
            .withoutVideoTrailer()
            .withoutVideo();
    }

    static aVideoWithAllMedias() {
        return new VideoFactory<Video>();
    }

    static theVideosWithoutMedias(countObjs: number) {
        return new VideoFactory<Video[]>(countObjs)
            .withoutVideoBanner()
            .withoutVideoThumbnail()
            .withoutVideoThumbnailHalf()
            .withoutVideoTrailer()
            .withoutVideo();
    }

    static theVideosWithAllMedias(countObjs: number) {
        return new VideoFactory<Video[]>(countObjs);
    }

    private chance: Chance.Chance;

    private constructor(countObjs: number = 1) {
        this.countObjs = countObjs;
        this.chance = Chance();
    }

    withVideoId(valueOrFactory: PropOrFactory<VideoId>) {
        this._videoId = valueOrFactory;
        return this;
    }

    withTitle(valueOrFactory: PropOrFactory<string>) {
        this._title = valueOrFactory;
        return this;
    }

    withDescription(valueOrFactory: PropOrFactory<string>) {
        this._description = valueOrFactory;
        return this;
    }

    withYearLaunched(valueOrFactory: PropOrFactory<number>) {
        this._yearLaunched = valueOrFactory;
        return this;
    }

    withDuration(valueOrFactory: PropOrFactory<number>) {
        this._duration = valueOrFactory;
        return this;
    }

    withRating(valueOrFactory: PropOrFactory<Rating>) {
        this._rating = valueOrFactory;
        return this;
    }

    withMarkAsOpened() {
        this._opened = true;
        return this;
    }

    withMarkAsNotOpened() {
        this._opened = false;
        return this;
    }

    withVideoBanner(valueOrFactory: PropOrFactory<ImageMedia | null>) {
        this._banner = valueOrFactory;
        return this;
    }

    withoutVideoBanner() {
        this._banner = null;
        return this;
    }

    withVideoThumbnail(valueOrFactory: PropOrFactory<ImageMedia | null>) {
        this._thumbnail = valueOrFactory;
        return this;
    }

    withoutVideoThumbnail() {
        this._thumbnail = null;
        return this;
    }

    withVideoThumbnailHalf(valueOrFactory: PropOrFactory<ImageMedia | null>) {
        this._thumbnailHalf = valueOrFactory;
        return this;
    }

    withoutVideoThumbnailHalf() {
        this._thumbnailHalf = null;
        return this;
    }

    withVideoTrailer(valueOrFactory: PropOrFactory<VideoTrailer | null>) {
        this._trailer = valueOrFactory;
        return this;
    }

    withVideoTrailerComplete() {
        this._trailer = VideoTrailer.create(
            'test name trailer',
            'test path trailer',
        ).complete('test encoded_location trailer');
        return this;
    }

    withoutVideoTrailer() {
        this._trailer = null;
        return this;
    }

    withVideo(valueOrFactory: PropOrFactory<VideoMedia | null>) {
        this._video = valueOrFactory;
        return this;
    }

    withVideoComplete() {
        this._video = VideoMedia.create(
            'test name video',
            'test path video',
        ).complete('test encoded_location video');
        return this;
    }

    withoutVideo() {
        this._video = null;
        return this;
    }

    addCategoryId(valueOrFactory: PropOrFactory<CategoryId>) {
        this._categoriesId.push(valueOrFactory);
        return this;
    }

    addGenreId(valueOrFactory: PropOrFactory<GenreId>) {
        this._genresId.push(valueOrFactory);
        return this;
    }

    addCastMemberId(valueOrFactory: PropOrFactory<CastMemberId>) {
        this._castMembersId.push(valueOrFactory);
        return this;
    }

    withInvalidTitleTooLong(value?: string) {
        this._title = value ?? this.chance.word({ length: 256 });
        return this;
    }

    withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
        this._createdAt = valueOrFactory;
        return this;
    }

    build(): TBuild {
        const videos = new Array(this.countObjs)
            .fill(undefined)
            .map((_, index) => {
                const categoryId = new CategoryId();
                const categoriesId = this._categoriesId.length
                    ? this.callFactory(this._categoriesId, index)
                    : [categoryId];

                const genreId = new GenreId();
                const genresId = this._genresId.length
                    ? this.callFactory(this._genresId, index)
                    : [genreId];

                const castMemberId = new CastMemberId();
                const castMembersId = this._castMembersId.length
                    ? this.callFactory(this._castMembersId, index)
                    : [castMemberId];

                const video = Video.create({
                    title: this.callFactory(this._title, index),
                    description: this.callFactory(this._description, index),
                    yearLaunched: this.callFactory(this._yearLaunched, index),
                    duration: this.callFactory(this._duration, index),
                    rating: this.callFactory(this._rating, index),
                    isOpened: this.callFactory(this._opened, index),
                    banner: this.callFactory(this._banner, index),
                    thumbnail: this.callFactory(this._thumbnail, index),
                    thumbnailHalf: this.callFactory(this._thumbnailHalf, index),
                    trailer: this.callFactory(this._trailer, index),
                    video: this.callFactory(this._video, index),
                    categoriesId: categoriesId,
                    genresId: genresId,
                    castMembersId: castMembersId,
                    ...(this._createdAt && {
                        createdAt: this.callFactory(this._createdAt, index),
                    }),
                });
                video['videoId'] = !this._videoId
                    ? video['videoId']
                    : this.callFactory(this._videoId, index);
                video.validate();
                return video;
            });
        return this.countObjs === 1 ? (videos[0] as any) : videos;
    }

    get videoId() {
        return this.getValue('videoId');
    }

    get title() {
        return this.getValue('title');
    }

    get description() {
        return this.getValue('description');
    }

    get yearLaunched() {
        return this.getValue('yearLaunched');
    }

    get duration() {
        return this.getValue('duration');
    }

    get rating() {
        return this.getValue('rating');
    }

    get isOpened() {
        return this.getValue('isOpened');
    }

    get banner() {
        const banner = this.getValue('banner');
        return (
            banner ??
            new VideoBanner({
                name: 'test-name-banner.png',
                location: 'test path banner',
            })
        );
    }

    get thumbnail() {
        const thumbnail = this.getValue('thumbnail');
        return (
            thumbnail ??
            new VideoThumbnail({
                name: 'test-name-thumbnail.png',
                location: 'test path thumbnail',
            })
        );
    }

    get thumbnailHalf() {
        const thumbnailHalf = this.getValue('thumbnailHalf');
        return (
            thumbnailHalf ??
            new VideoThumbnailHalf({
                name: 'test-name-thumbnail-half.png',
                location: 'test path thumbnail half',
            })
        );
    }

    get trailer() {
        const trailer = this.getValue('trailer');
        return (
            trailer ??
            VideoTrailer.create('test-name-trailer.mp4', 'test path trailer')
        );
    }

    get video() {
        const video = this.getValue('video');
        return (
            video ??
            VideoTrailer.create('test-name-video.mp4', 'test path video')
        );
    }

    get categoriesId(): CategoryId[] {
        let categories_id = this.getValue('categoriesId');

        if (!categories_id.length) {
            categories_id = [new CategoryId()];
        }
        return categories_id;
    }

    get genresId(): GenreId[] {
        let genresId = this.getValue('genresId');

        if (!genresId.length) {
            genresId = [new GenreId()];
        }
        return genresId;
    }

    get castMembersId(): CastMemberId[] {
        let castMembersId = this.getValue('castMembersId');

        if (!castMembersId.length) {
            castMembersId = [new CastMemberId()];
        }

        return castMembersId;
    }

    get createdAt() {
        return this.getValue('createdAt');
    }

    private getValue(prop: any) {
        const optional = ['videoId', 'createdAt'];
        const privateProp = `_${prop}` as keyof this;
        if (!this[privateProp] && optional.includes(prop)) {
            throw new Error(
                `Property ${prop} not have a factory, use 'with' methods`,
            );
        }
        return this.callFactory(this[privateProp], 0);
    }

    private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
        if (typeof factoryOrValue === 'function') {
            return factoryOrValue(index);
        }

        if (factoryOrValue instanceof Array) {
            return factoryOrValue.map((value) =>
                this.callFactory(value, index),
            );
        }

        return factoryOrValue;
    }
}
