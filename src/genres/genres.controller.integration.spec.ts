import CreateGenreUseCase, {
    CreateGenreOutput,
} from '@core/genre/application/use-cases/create-genre.use-case';
import { GenresController } from './genres.controller';
import { CreateGenreDto } from './dto/create-genre.dto';
import { GenreCollectionPresenter, GenrePresenter } from './genre.presenter';
import UpdateGenreUseCase, {
    UpdateGenreOutput,
} from '@core/genre/application/use-cases/update-genre.use-case';
import FindGenreUseCase, {
    FindGenreOutput,
} from '@core/genre/application/use-cases/find-genre.use-case';
import ListGenreUseCase, {
    ListGenresOutput,
} from '@core/genre/application/use-cases/list-genre.use-case';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database/database.module';
import { GenresModule } from './genres.module';
import { GENRE_PROVIDERS } from './genres.provider';
import { CATEGORY_PROVIDERS } from '../categories/categories.provider';
import { Sequelize } from 'sequelize-typescript';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import { getConnectionToken } from '@nestjs/sequelize';
import DeleteGenreUseCase from '@core/genre/application/use-cases/delete-genre.use-case';
import { CategoriesModule } from '../categories/categories.module';
import { UpdateGenreDto } from './dto/update-genre';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';
import { ApplicationModule } from '../application/application.module';
import { EventModule } from '../event/event.module';

// #TOTO - refactor with application service
describe.skip('GenresController Integration Tests', () => {
    let controller: GenresController;
    let genreRepository: IGenreRepository;
    let categoryRepository: ICategoryRepository;

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
        genreRepository = module.get<IGenreRepository>(
            GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        categoryRepository = module.get<ICategoryRepository>(
            CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
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

    it.skip('should creates a genre', async () => {
        const output: CreateGenreOutput = {
            id: '9366b7dc-2d71-4799-b91c-c64adb205104',
            name: 'genre',
            categories: [
                {
                    id: '8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a',
                    name: 'category',
                    isActive: true,
                },
            ],
            categoriesId: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
            //   is_active: true,
            createdAt: new Date(),
        };
        const mockCreateUseCase = {
            handle: jest.fn().mockReturnValue(Promise.resolve(output)),
        };
        //@ts-expect-error defined part of methods
        controller['createGenreUseCase'] = mockCreateUseCase;
        const input: CreateGenreDto = {
            name: 'genre',
            categoriesId: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
        };
        const presenter = await controller.create(input);
        expect(mockCreateUseCase.handle).toHaveBeenCalledWith(input);
        expect(presenter).toBeInstanceOf(GenrePresenter);
        expect(presenter).toStrictEqual(new GenrePresenter(output));
    });

    it.skip('should updates a genre', async () => {
        const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
        const output: UpdateGenreOutput = {
            id,
            name: 'genre',
            categories: [
                {
                    id: '8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a',
                    name: 'category',
                    isActive: true,
                },
            ],
            //   is_active: true,
            categoriesId: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
            createdAt: new Date(),
        };
        const mockUpdateUseCase = {
            handle: jest.fn().mockReturnValue(Promise.resolve(output)),
        };
        //@ts-expect-error defined part of methods
        controller['updateGenreUseCase'] = mockUpdateUseCase;
        const input: UpdateGenreDto = {
            name: 'genre',
            categoriesId: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
        };
        const presenter = await controller.update(id, input);
        expect(mockUpdateUseCase.handle).toHaveBeenCalledWith({
            id,
            ...input,
        });
        expect(presenter).toBeInstanceOf(GenrePresenter);
        expect(presenter).toStrictEqual(new GenrePresenter(output));
    });

    it.skip('should deletes a category', async () => {
        const expectedOutput = undefined;
        const mockDeleteUseCase = {
            handle: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
        };
        //@ts-expect-error defined part of methods
        controller['deleteGenreUseCase'] = mockDeleteUseCase;
        const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
        expect(controller.remove(id)).toBeInstanceOf(Promise);
        const output = await controller.remove(id);
        expect(mockDeleteUseCase.handle).toHaveBeenCalledWith({ id });
        expect(expectedOutput).toStrictEqual(output);
    });

    it.skip('should finds a category', async () => {
        const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
        const output: FindGenreOutput = {
            id,
            name: 'genre',
            categories: [
                {
                    id: '8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a',
                    name: 'category',
                    isActive: true,
                    //   createdAt: new Date(),
                },
            ],
            //   is_active: true,
            categoriesId: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
            createdAt: new Date(),
        };
        const mockGetUseCase = {
            handle: jest.fn().mockReturnValue(Promise.resolve(output)),
        };
        //@ts-expect-error defined part of methods
        controller['findGenreUseCase'] = mockGetUseCase;
        const presenter = await controller.findOne(id);
        expect(mockGetUseCase.handle).toHaveBeenCalledWith({ id });
        expect(presenter).toBeInstanceOf(GenrePresenter);
        expect(presenter).toStrictEqual(new GenrePresenter(output));
    });

    it.skip('should list categories', async () => {
        const output: ListGenresOutput = {
            items: [
                {
                    id: '9366b7dc-2d71-4799-b91c-c64adb205104',
                    name: 'genre',
                    categories: [
                        {
                            id: '8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a',
                            name: 'category',
                            isActive: true,
                            //   createdAt: new Date(),
                        },
                    ],
                    //   is_active: true,
                    categoriesId: ['8d0b0c9e-9b1a-4e8a-9e1a-3b2c1d7c6b5a'],
                    createdAt: new Date(),
                },
            ],
            currentPage: 1,
            lastPage: 1,
            perPage: 1,
            total: 1,
        };
        const mockListUseCase = {
            handle: jest.fn().mockReturnValue(Promise.resolve(output)),
        };
        //@ts-expect-error defined part of methods
        controller['listGenreUseCase'] = mockListUseCase;
        const searchParams = {
            page: 1,
            perPage: 2,
            sort: 'name',
            sortDir: 'desc' as SortDirection,
            filter: { name: 'actor test' },
        };
        const presenter = await controller.search(searchParams);
        expect(presenter).toBeInstanceOf(GenreCollectionPresenter);
        expect(mockListUseCase.handle).toHaveBeenCalledWith(searchParams);
        expect(presenter).toEqual(new GenreCollectionPresenter(output));
    });
});
