import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import ProcessAudioVideoInput from './process-audio-video.usecase.input';
import ProcessAudioVideoOutput from './process-audio-video.usecase.output';
import { VideoId } from '@core/video/domain/video.aggregate';
import VideoNotFoundError from '@core/video/domain/errors/video-not-found.error';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import { AudioVideoMediaRelatedField } from '@core/video/infra/database/sequelize/models/video-audio-media.model';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';

export default class ProcessAudioVideoUseCase
    implements IUseCase<ProcessAudioVideoInput, ProcessAudioVideoOutput>
{
    constructor(
        private readonly unitOfWork: IUnitOfWork,
        // private readonly storage: IStorage,
        private readonly repository: IVideoRepository,
    ) {}

    async handle(
        input: ProcessAudioVideoInput,
    ): Promise<ProcessAudioVideoOutput> {
        const videoId = new VideoId(input.videoId);
        const video = await this.repository.findById(videoId);
        if (!video) throw new VideoNotFoundError(input.videoId);

        if (input.field === AudioVideoMediaRelatedField.TRAILER) {
            if (!video.trailer) throw new Error('Trailer not found');
            const trailer =
                input.status === AudioVideoMediaStatus.COMPLETED
                    ? video.trailer.markAsCompleted(input.encodedLocation)
                    : video.trailer.markAsFailed();

            video.changeTrailer(trailer);
        }

        if (input.field === AudioVideoMediaRelatedField.VIDEO) {
            if (!video.video) throw new Error('Vídeo not found');
            const videoMedia =
                input.status === AudioVideoMediaStatus.COMPLETED
                    ? video.video.markAsCompleted(input.encodedLocation)
                    : video.video.markAsFailed();

            video.changeVideo(videoMedia);
        }

        await this.unitOfWork.execute(async () =>
            this.repository.update(video),
        );
    }
}
