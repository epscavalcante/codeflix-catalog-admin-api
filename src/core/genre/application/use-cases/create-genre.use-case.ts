import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import { CreateGenreInput } from '../mappers/create-genre.use-case.input';
import GenreOutputMapper, {
    GenreOutputType,
} from '../mappers/genre.use-case.output';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import CategoriesIdExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.validation';
import Genre from '@core/genre/domain/genre.aggregate';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import ApplicationService from '@core/shared/application/application.service';

export default class CreateGenreUseCase
    implements IUseCase<CreateGenreInput, CreateGenreOutput>
{
    constructor(
        private readonly applicationService: ApplicationService,
        private readonly genreRepository: IGenreRepository,
        private readonly categoryRepository: ICategoryRepository,
        private readonly categoriesIdExistsInDatabaseValidation: CategoriesIdExistsInDatabaseValidation,
    ) {}

    async handle(input: CreateGenreInput): Promise<GenreOutputType> {
        const [categoriesIdExists, categoriesNotFoundErrors] = (
            await this.categoriesIdExistsInDatabaseValidation.validate(
                input.categoriesId,
            )
        ).asArray();
        const genre = Genre.create({
            name: input.name,
            categoriesId: categoriesNotFoundErrors ? [] : categoriesIdExists!,
        });

        const notification = genre.notification;

        if (categoriesNotFoundErrors) {
            notification.setError(
                categoriesNotFoundErrors.map((error) => error.message),
                'categoriesId',
            );
        }

        if (notification.hasErrors())
            throw new EntityValidationError(notification.toJSON());

        await this.applicationService.run(async () => {
            return this.genreRepository.insert(genre);
        });

        const categories = await this.categoryRepository.findByIds(
            Array.from(genre.categoriesId.values()),
        );

        return GenreOutputMapper.toOutput(genre, categories);
    }
}

export type CreateGenreOutput = GenreOutputType;
