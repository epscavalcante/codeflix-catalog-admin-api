import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import EntityNotFoundException from '@core/shared/domain/exceptions/entity-not-found.exception';

@Catch(EntityNotFoundException)
export class NotFoundErrorFilter<T> implements ExceptionFilter {
    catch(exception: EntityNotFoundException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse();

        response.status(404).json({
            statusCode: 404,
            error: 'Not Found',
            message: exception.message,
        });
    }
}
