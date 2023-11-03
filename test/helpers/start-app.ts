import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { applyGlobalConfig } from '../../src/app.config.global';
import { AppModule } from '../../src/app.module';
import { getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

export function startApp() {
    let _app: INestApplication;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        const sequelizee: Sequelize = module.get<Sequelize>(
            getConnectionToken(),
        );

        await sequelizee.sync({ force: true });

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
