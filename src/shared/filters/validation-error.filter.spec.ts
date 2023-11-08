import { Controller, Get, INestApplication } from '@nestjs/common';
import { ValidationErrorFilter } from './validation-error.filter';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';

@Controller('stub')
class StubController {
    @Get()
    index() {
        throw new EntityValidationError([
            'some error',
            {
                field: ['field is required'],
            },
            {
                other_field: [
                    'other_field is required',
                    'other_field must be string',
                ],
            },
        ]);
    }
}

describe('ValidationErrorFilter Tests', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StubController],
        }).compile();

        app = module.createNestApplication();
        app.useGlobalFilters(new ValidationErrorFilter());
        await app.init();
    });

    it('should receives ValidationErrorFilter', () => {
        return request(app.getHttpServer())
            .get('/stub')
            .expect({
                statusCode: 422,
                error: 'Unprocessable Entity',
                message: [
                    'some error',
                    'field is required',
                    'other_field is required',
                    'other_field must be string',
                ],
            });
    });
});
