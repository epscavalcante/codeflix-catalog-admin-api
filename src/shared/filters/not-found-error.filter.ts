import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';

@Catch(EntityNotFoundError)
export class NotFoundErrorFilter<T> implements ExceptionFilter {
    catch(exception: EntityNotFoundError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse();

        response.status(404).json({
            statusCode: 404,
            error: 'Not Found',
            message: exception.message,
        });
    }
}
