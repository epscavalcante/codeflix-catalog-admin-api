import Notification from '@core/shared/domain/notification';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import VideoModel, {
    VideoCastMemberModel,
    VideoCategoryModel,
    VideoGenreModel,
} from '../models/video.model';
import Video, { VideoId } from '@core/video/domain/video.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import GenreId from '@core/genre/domain/genre.id.vo';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import VideoImageMediaModel, {
    ImageMediaRelatedField,
} from '../models/video-image-media.model';
import VideoBanner from '@core/video/domain/video-banner.vo';
import VideoThumbnail from '@core/video/domain/video-thumbnail.vo';
import VideoThumbnailHalf from '@core/video/domain/video-thumbnail-half.vo';
import AudioVideoMediaModel, {
    AudioVideoMediaRelatedField,
} from '../models/video-audio-media.model';
import VideoTrailer from '@core/video/domain/video-trailer.vo';
import VideoMedia from '@core/video/domain/video-media.vo';
import Rating from '@core/video/domain/video-rating.vo';

export default class VideoModelMapper {
    static toEntity(model: VideoModel) {
        const {
            videoId,
            categoriesId = [],
            genresId = [],
            castMembersId = [],
            imageMedias = [],
            audioVideoMedias = [],
            ...otherData
        } = model.toJSON();

        const categoriesIdMap = categoriesId.map(
            (categoryId) => new CategoryId(categoryId.categoryId),
        );
        const genresIdMap = genresId.map(
            (genreId) => new GenreId(genreId.genreId),
        );
        const castMembersIdMap = castMembersId.map(
            (castMemberId) => new CastMemberId(castMemberId.castMemberId),
        );

        const notification = new Notification();
        if (!categoriesIdMap.length) {
            notification.addError(
                'categoriesId should not be empty',
                'categoriesId',
            );
        }
        if (!genresIdMap.length) {
            notification.addError('genresId should not be empty', 'genresId');
        }

        if (!castMembersIdMap.length) {
            notification.addError(
                'castMembersId should not be empty',
                'castMembersId',
            );
        }

        const bannerModel = imageMedias.find(
            (imageMedia) =>
                imageMedia.videoRelatedField === ImageMediaRelatedField.BANNER,
        );
        const banner = bannerModel
            ? new VideoBanner({
                  name: bannerModel.name,
                  location: bannerModel.location,
              })
            : null;

        const thumbnailModel = imageMedias.find(
            (imageMedia) =>
                imageMedia.videoRelatedField ===
                ImageMediaRelatedField.THUMBNAIL,
        );
        const thumbnail = thumbnailModel
            ? new VideoThumbnail({
                  name: thumbnailModel.name,
                  location: thumbnailModel.location,
              })
            : null;

        const thumbnailHalfModel = imageMedias.find(
            (imageMedia) =>
                imageMedia.videoRelatedField ===
                ImageMediaRelatedField.THUMBNAIL_HALF,
        );

        const thumbnailHalf = thumbnailHalfModel
            ? new VideoThumbnailHalf({
                  name: thumbnailHalfModel.name,
                  location: thumbnailHalfModel.location,
              })
            : null;

        const trailerModel = audioVideoMedias.find(
            (imageMedia) =>
                imageMedia.videoRelatedField ===
                AudioVideoMediaRelatedField.TRAILER,
        );

        const trailer = trailerModel
            ? new VideoTrailer({
                  name: trailerModel.name,
                  status: trailerModel.status,
                  rawLocation: trailerModel.rawLocation,
                  encodedLocation: trailerModel.encodedLocation ?? null,
              })
            : null;
        const audioVideoModel = audioVideoMedias.find(
            (imageMedia) =>
                imageMedia.videoRelatedField ===
                AudioVideoMediaRelatedField.VIDEO,
        );

        const audioVideo = audioVideoModel
            ? new VideoMedia({
                  name: audioVideoModel.name,
                  status: audioVideoModel.status,
                  rawLocation: audioVideoModel.rawLocation,
                  encodedLocation: audioVideoModel.encodedLocation ?? null,
              })
            : null;

        const [rating, errorRating] = Rating.create(otherData.rating).asArray();
        if (errorRating) notification.addError(errorRating.message, 'rating');

        const video = new Video({
            videoId: new VideoId(videoId),
            ...otherData,
            rating,
            genresId: new Map(
                genresIdMap.map((genreId) => [genreId.value, genreId]),
            ),
            categoriesId: new Map(
                categoriesIdMap.map((ategoryId) => [
                    ategoryId.value,
                    ategoryId,
                ]),
            ),
            castMembersId: new Map(
                castMembersIdMap.map((castMemberId) => [
                    castMemberId.value,
                    castMemberId,
                ]),
            ),
            video: audioVideo,
            banner,
            thumbnail,
            thumbnailHalf,
            trailer,
        });

        video.validate();

        notification.copyErrors(video.notification);

        if (notification.hasErrors()) {
            throw new EntityValidationError(notification.toJSON());
        }

        return video;
    }

    static toModel(entity: Video) {
        const props = this.toModelProps(entity);
        const relationsToBeIncluded = [
            { has: props.categoriesId.length, field: 'categoriesId' },
            { has: props.genresId.length, field: 'genresId' },
            { has: props.castMembersId.length, field: 'castMembersId' },
            { has: props.imageMedias.length, field: 'imageMedias' },
            { has: props.audioVideoMedias.length, field: 'audioVideoMedias' },
        ]
            .map((item) => (item.has ? item.field : null))
            .filter(Boolean) as [];

        console.log(relationsToBeIncluded);
        return VideoModel.build(props, {
            include: relationsToBeIncluded,
        });
    }

    static toModelProps(entity: Video) {
        const {
            categoriesId,
            genresId,
            castMembersId,
            trailer,
            video,
            banner,
            thumbnail,
            thumbnailHalf,
            ...otherData
        } = entity.toJSON();

        return {
            ...otherData,
            categoriesId: categoriesId.map(
                (categoryId) =>
                    new VideoCategoryModel({
                        videoId: entity.videoId.value,
                        categoryId,
                    }),
            ),
            genresId: genresId.map(
                (genreId) =>
                    new VideoGenreModel({
                        videoId: entity.videoId.value,
                        genreId,
                    }),
            ),
            castMembersId: castMembersId.map(
                (castMemberId) =>
                    new VideoCastMemberModel({
                        videoId: entity.videoId.value,
                        castMemberId,
                    }),
            ),
            imageMedias: [
                {
                    media: banner,
                    videoRelatedField: ImageMediaRelatedField.BANNER,
                },
                {
                    media: thumbnail,
                    videoRelatedField: ImageMediaRelatedField.THUMBNAIL,
                },
                {
                    media: thumbnailHalf,
                    videoRelatedField: ImageMediaRelatedField.THUMBNAIL_HALF,
                },
            ]
                .map((item) => {
                    return item.media
                        ? VideoImageMediaModel.build({
                              name: item.media.name,
                              location: item.media.location,
                              videoId: entity.videoId.value,
                              videoRelatedField: item.videoRelatedField,
                          } as any)
                        : null;
                })
                .filter(Boolean) as VideoImageMediaModel[],
            audioVideoMedias: [
                {
                    media: trailer,
                    videoRelatedField: AudioVideoMediaRelatedField.TRAILER,
                },
                {
                    media: video,
                    videoRelatedField: AudioVideoMediaRelatedField.VIDEO,
                },
            ]
                .map((audioVideoMedia) => {
                    return audioVideoMedia.media
                        ? AudioVideoMediaModel.build({
                              videoId: entity.videoId.value,
                              name: audioVideoMedia.media.name,
                              status: audioVideoMedia.media.status,
                              rawLocation: audioVideoMedia.media.rawLocation,
                              encodedLocation:
                                  audioVideoMedia.media.encodedLocation,
                              videoRelatedField:
                                  audioVideoMedia.videoRelatedField,
                          } as any)
                        : null;
                })
                .filter(Boolean) as AudioVideoMediaModel[],
        };
    }
}
