import AudioVideoMedia, {
    AudioVideoMediaStatus,
} from '@core/shared/domain/value-objects/audio-video-media.vo';
import { VideoId } from './video.aggregate';
import MediaFileValidator from '@core/shared/domain/validations/media-file.validator';
import { Either } from '@core/shared/domain/either';
import MediaFileSizeError from '@core/shared/domain/errors/media-file-size.error';
import MediaFileMimeTypeError from '@core/shared/domain/errors/media-file-mime-type.error';

export default class VideoTrailer extends AudioVideoMedia {
    static MAX_SIZE = 1024 * 1024 * 500; //500MB
    static MIME_TYPES = ['video/mp4'];

    static create(name: string, rawLocation: string) {
        return new VideoTrailer({
            name,
            rawLocation,
            status: AudioVideoMediaStatus.PENDING,
        });
    }

    static createFromFile(
        rawName: string,
        mimeType: string,
        size: number,
        videoId: VideoId,
    ) {
        const mediaFileValidator = new MediaFileValidator(
            this.MAX_SIZE,
            this.MIME_TYPES,
        );

        return Either.safe<
            VideoTrailer,
            MediaFileSizeError | MediaFileMimeTypeError
        >(() => {
            const { name } = mediaFileValidator.validate(
                rawName,
                mimeType,
                size,
            );

            return VideoTrailer.create(
                name,
                `videos/${videoId.value}/trailers`,
            );
        });
    }

    process() {
        return new VideoTrailer({
            name: this.name,
            rawLocation: this.rawLocation,
            encodedLocation: this.encodedLocation,
            status: AudioVideoMediaStatus.PROCESSING,
        });
    }

    complete(encodedLocation: string) {
        return new VideoTrailer({
            name: this.name,
            rawLocation: this.rawLocation,
            encodedLocation,
            status: AudioVideoMediaStatus.COMPLETED,
        });
    }

    failed() {
        return new VideoTrailer({
            name: this.name,
            rawLocation: this.rawLocation,
            encodedLocation: this.encodedLocation,
            status: AudioVideoMediaStatus.FAILED,
        });
    }
}
