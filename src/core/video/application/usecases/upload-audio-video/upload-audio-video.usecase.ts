import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import UploadAudioVideoInput from './upload-audio-video.usecase.input';
import UploadAudioVideoOutput from './upload-audio-video.usecase.output';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import { VideoId } from '@core/video/domain/video.aggregate';
import VideoNotFoundError from '@core/video/domain/errors/video-not-found.error';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import IStorage from '@core/shared/domain/storage.interface';
import { AudioVideoMediaRelatedField } from '@core/video/infra/database/sequelize/models/video-audio-media.model';
import VideoTrailer from '@core/video/domain/video-trailer.vo';
import VideoMedia from '@core/video/domain/video-media.vo';
import ApplicationService from '@core/shared/application/application.service';

export default class UploadAudioVideoUseCase
    implements IUseCase<UploadAudioVideoInput, UploadAudioVideoOutput>
{
    constructor(
        private readonly applicationService: ApplicationService,
        private readonly storage: IStorage,
        private readonly repository: IVideoRepository,
    ) {}

    async handle(
        input: UploadAudioVideoInput,
    ): Promise<UploadAudioVideoOutput> {
        const videoId = new VideoId(input.videoId);
        const video = await this.repository.findById(videoId);
        if (!video) throw new VideoNotFoundError(input.videoId);

        const videosMap = {
            [AudioVideoMediaRelatedField.TRAILER]: VideoTrailer,
            [AudioVideoMediaRelatedField.VIDEO]: VideoMedia,
        };

        const [videoMedia, videoMediaError] = videosMap[input.videoField]
            .createFromFile(
                input.file.rawName,
                input.file.mimeType,
                input.file.size,
                videoId,
            )
            .asArray();

        if (videoMediaError)
            throw new EntityValidationError([
                { [input.videoField]: [videoMediaError.message] },
            ]);

        videoMedia instanceof VideoTrailer && video.changeTrailer(videoMedia);
        videoMedia instanceof VideoMedia && video.changeVideo(videoMedia);

        await this.storage.put({
            file: input.file.data,
            mimeType: input.file.mimeType,
            id: videoMedia!.url,
        });

        await this.applicationService.run(async () =>
            this.repository.update(video),
        );
    }
}
