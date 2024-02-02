import IUseCase from '@core/shared/application/use-cases/use-case.interface';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import { UpdateGenreInput } from '../mappers/update-genre.use-case.input';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import GenreId from '@core/genre/domain/genre.id.vo';
import { GenreNotFoundError } from '@core/genre/domain/errors/genre-not-found.error';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import GenreOutputMapper, {
    GenreOutputType,
} from '../mappers/genre.use-case.output';
import CategoriesIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.validation';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';

export default class UpdateGenreUseCase
    implements IUseCase<UpdateGenreInput, UpdateGenreOutput>
{
    constructor(
        private readonly unitOfWork: IUnitOfWork,
        private readonly repository: IGenreRepository,
        private readonly categoryRepository: ICategoryRepository,
        private readonly categoriesIdExistsInDatabaseValidation: CategoriesIdsExistsInDatabaseValidation,
    ) {}

    async handle(input: UpdateGenreInput): Promise<UpdateGenreOutput> {
        const genre = await this.repository.findById(new GenreId(input.id));

        if (!genre) throw new GenreNotFoundError(input.id);

        input.name && genre.changeName(input.name);

        const notification = genre.notification;

        if (input.categoriesId) {
            const [categoriesIdExists, categoriesNotFoundErrors] = (
                await this.categoriesIdExistsInDatabaseValidation.validate(
                    input.categoriesId,
                )
            ).asArray();

            if (categoriesIdExists) genre.syncCategoriesId(categoriesIdExists);

            if (categoriesNotFoundErrors) {
                notification.setError(
                    categoriesNotFoundErrors.map((error) => error.message),
                    'categoriesId',
                );
            }
        }

        if (genre.notification.hasErrors()) {
            throw new EntityValidationError(genre.notification.toJSON());
        }

        await this.unitOfWork.execute(async () => {
            return this.repository.update(genre);
        });

        const categories = await this.categoryRepository.findByIds(
            Array.from(genre.categoriesId.values()),
        );

        return GenreOutputMapper.toOutput(genre, categories);
    }
}

export type UpdateGenreOutput = GenreOutputType;
