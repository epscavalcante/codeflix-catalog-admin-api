import { Either } from '@core/shared/domain/either';
import MediaFileValidator from '@core/shared/domain/validations/media-file.validator';
import ImageMedia from '@core/shared/domain/value-objects/image-media.vo';
import { VideoId } from './video.aggregate';
import MediaFileSizeError from '@core/shared/domain/errors/media-file-size.error';
import MediaFileMimeTypeError from '@core/shared/domain/errors/media-file-mime-type.error';

export default class VideoBanner extends ImageMedia {
    static MAX_SIZE = 1024 * 1024 * 2; // 2MB
    static MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
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
            VideoBanner,
            MediaFileSizeError | MediaFileMimeTypeError
        >(() => {
            const { name } = mediaFileValidator.validate(
                rawName,
                mimeType,
                size,
            );
            return new VideoBanner({
                name,
                location: `videos/${videoId.value}/images`,
            });
        });
    }
}
