import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';
import Rating from '@core/video/domain/video-rating.vo';
import { VideoId } from '@core/video/domain/video.aggregate';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import UpdateVideoInput from './update-video.usecase.input';
import UpdateVideoOutput from './update-video.usecase.output';
import VideoNotFoundError from '@core/video/domain/errors/video-not-found.error';
import ICategoryIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.interface';
import IGenresIdExistsInDatabaseValidation from '@core/genre/application/validations/genres-ids-exists-in-database.interface';
import ICastMemberIdsExistsInDatabaseValidation from '@core/cast-member/application/validations/cast-members-ids-exists-in-database.interface';

export default class UpdateVideoUseCase
    implements IUseCase<UpdateVideoInput, UpdateVideoOutput>
{
    constructor(
        private readonly unitOfWork: IUnitOfWork,
        private readonly repository: IVideoRepository,
        private readonly categoriesIdExistsInDatabaseValidation: ICategoryIdsExistsInDatabaseValidation,
        private readonly genresIdExistsInDatabaseValidation: IGenresIdExistsInDatabaseValidation,
        private readonly castMembersIdExistsInDatabaseValidation: ICastMemberIdsExistsInDatabaseValidation,
    ) {}

    async handle(input: UpdateVideoInput): Promise<UpdateVideoOutput> {
        const videoId = new VideoId(input.id);
        const videoFound = await this.repository.findById(videoId);
        if (!videoFound) throw new VideoNotFoundError(input.id);
        const notification = videoFound.notification;

        input.title && videoFound.changeTitle(input.title);
        input.description && videoFound.changeDescription(input.description);
        input.duration && videoFound.changeDuration(input.duration);
        input.yearLaunched && videoFound.changeYearLaunched(input.yearLaunched);
        input.isOpened
            ? videoFound.markAsOpened()
            : videoFound.markAsNotOpened();
        if (input.rating) {
            const [rating, errorRating] = Rating.create(input.rating).asArray();
            if (errorRating)
                notification.setError(errorRating.message, 'rating');
            videoFound.changeRating(rating);
        }

        if (input.genresId) {
            const genresIdValidation =
                await this.genresIdExistsInDatabaseValidation.validate(
                    input.genresId,
                );
            const [genresId, genresIdNotFoundErrors] =
                genresIdValidation.asArray();

            if (genresId) videoFound.syncGenresId(genresId);
            if (genresIdNotFoundErrors) {
                genresIdNotFoundErrors.map(
                    (genreIdNotFoundError) =>
                        notification.setError(genreIdNotFoundError.message),
                    'genresId',
                );
            }
        }

        if (input.categoriesId) {
            const categoriesIdValidation =
                await this.categoriesIdExistsInDatabaseValidation.validate(
                    input.categoriesId,
                );
            const [categoriesId, categoriesIdNotFoundErrors] =
                categoriesIdValidation.asArray();
            if (categoriesId) videoFound.syncCategoriesId(categoriesId);
            if (categoriesIdNotFoundErrors) {
                categoriesIdNotFoundErrors.map(
                    (categoryIdNotFoundError) =>
                        notification.setError(categoryIdNotFoundError.message),
                    'categoriesId',
                );
            }
        }

        if (input.castMembersId) {
            const castMembersIdValidation =
                await this.castMembersIdExistsInDatabaseValidation.validate(
                    input.castMembersId,
                );
            const [castMembersId, castMembersIdNotFoundErrors] =
                castMembersIdValidation.asArray();

            if (castMembersId) videoFound.syncCastMembersId(castMembersId);
            if (castMembersIdNotFoundErrors) {
                castMembersIdNotFoundErrors.map(
                    (castMemberIdNotFoundError) =>
                        notification.setError(
                            castMemberIdNotFoundError.message,
                        ),
                    'castMembersId',
                );
            }
        }

        if (notification.hasErrors())
            throw new EntityValidationError(notification.toJSON());

        await this.unitOfWork.execute(async () =>
            this.repository.update(videoFound),
        );

        return { id: videoFound.videoId.value };
    }
}
