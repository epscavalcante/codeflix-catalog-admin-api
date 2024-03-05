import CreateGenreUseCase from '@core/genre/application/use-cases/create-genre.use-case';
import { GenresController } from './genres.controller';
import UpdateGenreUseCase from '@core/genre/application/use-cases/update-genre.use-case';
import FindGenreUseCase from '@core/genre/application/use-cases/find-genre.use-case';
import ListGenreUseCase from '@core/genre/application/use-cases/list-genre.use-case';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database/database.module';
import { GenresModule } from './genres.module';
import { Sequelize } from 'sequelize-typescript';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import { getConnectionToken } from '@nestjs/sequelize';
import DeleteGenreUseCase from '@core/genre/application/use-cases/delete-genre.use-case';
import { CategoriesModule } from '../categories/categories.module';
import { ApplicationModule } from '../application/application.module';
import { EventModule } from '../event/event.module';

// #TOTO - refactor with application service
describe.skip('GenresController Integration Tests', () => {
    let controller: GenresController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot(),
                DatabaseModule,
                EventModule,
                ApplicationModule,
                CategoriesModule,
                GenresModule,
            ],
        })
            .overrideProvider('UnitOfWork')
            .useFactory({
                factory: (sequelize: Sequelize) => {
                    return new SequelizeUnitOfWorkRepository(sequelize);
                },
                inject: [getConnectionToken()],
            })
            .compile();
        controller = module.get<GenresController>(GenresController);
    });

    test('ok', () => {
        expect(1).toBe(1);
    });

    test('Deve instanciar corretamente os componentes', () => {
        expect(controller).toBeDefined();
        expect(controller['createGenreUseCase']).toBeInstanceOf(
            CreateGenreUseCase,
        );
        expect(controller['listGenreUseCase']).toBeInstanceOf(ListGenreUseCase);
        expect(controller['findGenreUseCase']).toBeInstanceOf(FindGenreUseCase);
        expect(controller['updateGenreUseCase']).toBeInstanceOf(
            UpdateGenreUseCase,
        );
        expect(controller['deleteGenreUseCase']).toBeInstanceOf(
            DeleteGenreUseCase,
        );
    });
});
