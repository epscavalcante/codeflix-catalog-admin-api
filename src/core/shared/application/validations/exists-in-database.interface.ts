// expo
import { Either } from '@core/shared/domain/either';
import Uuid from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from 'rxjs';

export default interface IExistsInDatabaseValidation {
    validate(
        ids: string[],
    ): Promise<Either<Uuid[] | null, NotFoundError[] | null>>;
}
