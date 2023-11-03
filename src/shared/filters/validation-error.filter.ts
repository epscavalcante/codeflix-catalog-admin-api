import EntityValidationException from '@core/domain/exceptions/entity-validation-error.exception';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { union } from 'lodash';

@Catch(EntityValidationException)
export class ValidationErrorFilter<T> implements ExceptionFilter {
    catch(exception: EntityValidationException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse();

        return response.status(422).json({
            statusCode: 422,
            error: 'Unprocessable Entity',
            message: union(
                ...exception.error.reduce((acc, error) =>
                    acc.concat(
                        // @ts-ignore
                        typeof error === 'string'
                            ? [[error]]
                            : Object.values(error),
                    ),
                    []
                ),
            ),
        });
    }
}
