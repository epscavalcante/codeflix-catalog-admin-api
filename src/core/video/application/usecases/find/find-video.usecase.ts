import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import FindVideoInput from './find-video.usecase.input';
import VideoNotFoundError from '@core/video/domain/errors/video-not-found.error';
import FindVideoOutput from './find-video.usecase.output';
import VideoUseCaseMapper from '../video.usecase.mapper';
import { VideoId } from '@core/video/domain/video.aggregate';

export default class FindVideoUseCase
    implements IUseCase<FindVideoInput, FindVideoOutput>
{
    constructor(
        private readonly videoRepository: IVideoRepository,
        private readonly genreRepository: IGenreRepository,
        private readonly categoryRepository: ICategoryRepository,
        private readonly castMemberRepository: ICastMemberRepository,
    ) {}

    async handle(input: FindVideoInput): Promise<FindVideoOutput> {
        const videoId = new VideoId(input.id);
        const videoFound = await this.videoRepository.findById(videoId);

        if (!videoFound) throw new VideoNotFoundError(input.id);

        const genres = await this.genreRepository.findByIds(
            Array.from(videoFound.genresId.values()),
        );
        const categories = await this.categoryRepository.findByIds(
            Array.from(videoFound.categoriesId.values()).concat(
                genres.flatMap((genre) =>
                    Array.from(genre.categoriesId.values()),
                ),
            ),
        );
        const castMembers = await this.castMemberRepository.findByIds(
            Array.from(videoFound.castMembersId.values()),
        );

        return VideoUseCaseMapper.toOutput(videoFound, {
            categories,
            castMembers,
            genres,
        });
    }
}
