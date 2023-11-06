import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { union } from 'lodash';

@Catch(EntityValidationError)
export class ValidationErrorFilter<T> implements ExceptionFilter {
    catch(exception: EntityValidationError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse();

        return response.status(422).json({
            statusCode: 422,
            error: 'Unprocessable Entity',
            message: union(
                ...exception.error.reduce(
                    (acc, error) =>
                        acc.concat(
                            // @ts-ignore
                            typeof error === 'string'
                                ? [[error]]
                                : Object.values(error),
                        ),
                    [],
                ),
            ),
        });
    }
}
