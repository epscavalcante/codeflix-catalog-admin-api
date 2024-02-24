import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';
import Rating from '@core/video/domain/video-rating.vo';
import Video from '@core/video/domain/video.aggregate';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import CreateVideoInput from './create-video.usecase.input';
import CreateVideoOutput from './create-video.usecase.output';
import IExistsInDatabaseValidation from '@core/shared/application/validations/exists-in-database.interface';

export default class CreateVideoUseCase
    implements IUseCase<CreateVideoInput, CreateVideoOutput>
{
    constructor(
        private readonly unitOfWork: IUnitOfWork,
        private readonly repository: IVideoRepository,
        private readonly categoriesIdExistsInDatabaseValidation: IExistsInDatabaseValidation,
        private readonly genresIdExistsInDatabaseValidation: IExistsInDatabaseValidation,
        private readonly castMembersIdExistsInDatabaseValidation: IExistsInDatabaseValidation,
    ) {}

    async handle(input: CreateVideoInput): Promise<CreateVideoOutput> {
        const [rating, errorRating] = Rating.create(input.rating).asArray();

        const [
            genresIdValidation,
            categoriesIdValidation,
            castMembersIdValidation,
        ] = await Promise.all([
            await this.genresIdExistsInDatabaseValidation.validate(
                input.genresId,
            ),
            await this.categoriesIdExistsInDatabaseValidation.validate(
                input.categoriesId,
            ),
            await this.castMembersIdExistsInDatabaseValidation.validate(
                input.castMembersId,
            ),
        ]);

        const [genresId, genresIdNotFoundErrors] = genresIdValidation.asArray();
        const [categoriesId, categoriesIdNotFoundErrors] =
            categoriesIdValidation.asArray();
        const [castMembersId, castMembersIdNotFoundErrors] =
            castMembersIdValidation.asArray();

        const video = Video.create({
            ...input,
            rating,
            genresId: genresIdNotFoundErrors || !genresId ? [] : genresId,
            categoriesId:
                categoriesIdNotFoundErrors || !categoriesId ? [] : categoriesId,
            castMembersId:
                castMembersIdNotFoundErrors || !castMembersId
                    ? []
                    : castMembersId,
        });
        const notification = video.notification;

        if (errorRating) notification.setError(errorRating.message, 'rating');
        if (genresIdNotFoundErrors) {
            genresIdNotFoundErrors.map(
                (genreIdNotFoundError) =>
                    notification.setError(genreIdNotFoundError.message),
                'genresId',
            );
        }
        if (categoriesIdNotFoundErrors) {
            categoriesIdNotFoundErrors.map(
                (categoryIdNotFoundError) =>
                    notification.setError(categoryIdNotFoundError.message),
                'categoriesId',
            );
        }
        if (castMembersIdNotFoundErrors) {
            castMembersIdNotFoundErrors.map(
                (castMemberIdNotFoundError) =>
                    notification.setError(castMemberIdNotFoundError.message),
                'castMembersId',
            );
        }

        if (notification.hasErrors())
            throw new EntityValidationError(notification.toJSON());

        await this.unitOfWork.execute(async () =>
            this.repository.insert(video),
        );

        return { ...video.toJSON(), id: video.videoId.value } as any; //{ id: video.videoId.value };
    }
}
