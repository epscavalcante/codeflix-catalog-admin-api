import { Controller, Get, INestApplication } from '@nestjs/common';
import Entity from '@core/shared/domain/entity';
import { NotFoundErrorFilter } from './not-found-error.filter';
import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

class StubEntity extends Entity {
    entityId: any;
    toJSON(): Required<any> {
        return {};
    }
}

@Controller('stub')
class StubController {
    @Get()
    index() {
        throw new EntityNotFoundError('fake_id', StubEntity);
    }
}

describe('NotFoundErrorFilter Test', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StubController],
        }).compile();
        app = module.createNestApplication();
        app.useGlobalFilters(new NotFoundErrorFilter());
        await app.init();
    });

    it('should receives response NotFoundErrorFilter', () => {
        return request(app.getHttpServer()).get('/stub').expect({
            statusCode: 404,
            message: 'StubEntity not found using ID: fake_id',
            error: 'Not Found',
        });
    });
});
