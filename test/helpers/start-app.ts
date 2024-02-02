import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { applyGlobalConfig } from '../../src/app.config.global';
import { AppModule } from '../../src/app.module';
import { getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';

export function startApp() {
    let _app: INestApplication;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider('UnitOfWork')
            .useFactory({
                factory: (sequelize: Sequelize) => {
                    return new SequelizeUnitOfWorkRepository(sequelize as any);
                },
                inject: [getConnectionToken()],
            })
            .compile();

        const sequelize: Sequelize = module.get<Sequelize>(
            getConnectionToken(),
        );

        await sequelize.sync({ force: true });

        _app = module.createNestApplication();
        applyGlobalConfig(_app);
        await _app.init();
    });

    afterEach(async () => {
        await _app?.close();
    });

    return {
        get app() {
            return _app;
        },
    };
}
