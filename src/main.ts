import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NotFoundErrorFilter } from './shared/filters/not-found-error.filter';
import { ValidationErrorFilter } from './shared/filters/validation-error.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            errorHttpStatusCode: 422,
        }),
    );

    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    app.useGlobalFilters(
        new NotFoundErrorFilter(),
        new ValidationErrorFilter(),
    );

    await app.listen(3002);
}

bootstrap();
