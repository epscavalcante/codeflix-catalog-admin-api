import Video, { VideoId } from '@core/video/domain/video.aggregate';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import VideoMemoryRepository from '@core/video/infra/repositories/video-memory.repository';
import DeleteVideoUseCase from './delete-video.usecase';
import InvalidUuidException from '@core/shared/domain/errors/uuid-validation.error';
import VideoNotFoundError from '@core/video/domain/errors/video-not-found.error';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';
import MemoryUnitOfWorkRepository from '@core/shared/infra/repositories/memory-unit-of-work.repository';

describe('DeleteVideoUseCase unit test', () => {
    let useCase: DeleteVideoUseCase;
    let unitOfWork: IUnitOfWork;
    let videoRepository: IVideoRepository;

    beforeEach(() => {
        unitOfWork = new MemoryUnitOfWorkRepository();
        videoRepository = new VideoMemoryRepository();
        useCase = new DeleteVideoUseCase(unitOfWork, videoRepository);
    });

    test('Deve lançar InvalidUuidExeception com id fake', async () => {
        await expect(() => useCase.handle({ id: 'fake' })).rejects.toThrow(
            new InvalidUuidException(),
        );
    });

    test('Deve lançar EntiityNotFoundExeception pq video não foi encontrada.', async () => {
        const uuid = new VideoId();

        await expect(() => useCase.handle({ id: uuid.value })).rejects.toThrow(
            new VideoNotFoundError(uuid.value),
        );
    });

    test('Deve criar um vídeo', async () => {
        const spyVideoDelete = jest.spyOn(videoRepository, 'delete');

        const video = Video.fake().aVideoWithAllMedias().build();
        await videoRepository.insert(video);

        await useCase.handle({
            id: video.videoId.value,
        });

        expect(spyVideoDelete).toHaveBeenCalledTimes(1);
        expect(videoRepository['items']).toHaveLength(0);
    });
});
