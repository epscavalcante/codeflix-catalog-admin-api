import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import DeleteVideoUseCaseInput from './delete-video.usecase.input';
import DeleteVideoUseCaseOutput from './delete-video.usecase.output';
import { VideoId } from '@core/video/domain/video.aggregate';
import IVideoRepository from '@core/video/domain/video.repository.interface';

export default class DeleteVideoUseCase
    implements IUseCase<DeleteVideoUseCaseInput, DeleteVideoUseCaseOutput>
{
    constructor(private readonly videoRepository: IVideoRepository) {}
    async handle(input: DeleteVideoUseCaseInput): Promise<void> {
        const videoId = new VideoId(input.id);

        return this.videoRepository.delete(videoId);
    }
}
