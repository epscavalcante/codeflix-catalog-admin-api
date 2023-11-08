import {
    ClassSerializerInterceptor,
    INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NotFoundErrorFilter } from './shared/filters/not-found-error.filter';
import { ValidationErrorFilter } from './shared/filters/validation-error.filter';

export function applyGlobalConfig(app: INestApplication) {
    app.useGlobalPipes(
        new ValidationPipe({
            errorHttpStatusCode: 422,
            transform: true,
        }),
    );

    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    app.useGlobalFilters(
        new NotFoundErrorFilter(),
        new ValidationErrorFilter(),
    );
}
