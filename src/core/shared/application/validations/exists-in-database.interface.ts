// expo
import { Either } from '@core/shared/domain/either';

export default interface IExistsInDatabaseValidation<I, E> {
    validate(ids: string[]): Promise<Either<I[] | null, E[] | null>>;
}
