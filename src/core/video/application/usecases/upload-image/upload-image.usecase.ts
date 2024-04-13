import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import UploadImageInput from './upload-image.usecase.input';
import UploadImageOutput from './upload-image.usecase.output';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import { VideoId } from '@core/video/domain/video.aggregate';
import VideoNotFoundError from '@core/video/domain/errors/video-not-found.error';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import { ImageMediaRelatedField } from '@core/video/infra/database/sequelize/models/video-image-media.model';
import VideoBanner from '@core/video/domain/video-banner.vo';
import VideoThumbnail from '@core/video/domain/video-thumbnail.vo';
import VideoThumbnailHalf from '@core/video/domain/video-thumbnail-half.vo';
import IStorage from '@core/shared/domain/storage.interface';

export default class UploadImageUseCase
    implements IUseCase<UploadImageInput, UploadImageOutput>
{
    constructor(
        private readonly unitOfWork: IUnitOfWork,
        private readonly storage: IStorage,
        private readonly repository: IVideoRepository,
    ) {}

    async handle(input: UploadImageInput): Promise<UploadImageOutput> {
        const videoId = new VideoId(input.videoId);
        const video = await this.repository.findById(videoId);
        if (!video) throw new VideoNotFoundError(input.videoId);

        const imagesMap = {
            [ImageMediaRelatedField.BANNER]: VideoBanner,
            [ImageMediaRelatedField.THUMBNAIL]: VideoThumbnail,
            [ImageMediaRelatedField.THUMBNAIL_HALF]: VideoThumbnailHalf,
        };

        const [image, imageError] = imagesMap[input.videoField]
            .createFromFile(
                input.file.rawName,
                input.file.mimeType,
                input.file.size,
                videoId,
            )
            .asArray();

        if (imageError)
            throw new EntityValidationError([
                { [input.videoField]: [imageError.message] },
            ]);

        image instanceof VideoBanner && video.changeBanner(image);
        image instanceof VideoThumbnail && video.changeThumbnail(image);
        image instanceof VideoThumbnailHalf && video.changeThumbnailHalf(image);

        await this.storage.put({
            file: input.file.data,
            mimeType: input.file.mimeType,
            id: image!.url,
        });

        await this.unitOfWork.execute(async () =>
            this.repository.update(video),
        );
    }
}
