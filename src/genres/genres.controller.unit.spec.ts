import { CreateGenreOutput } from '@core/genre/application/use-cases/create-genre.use-case';
import { GenresController } from './genres.controller';
import { CreateGenreDto } from './dto/create-genre.dto';
import { GenreCollectionPresenter, GenrePresenter } from './genre.presenter';
import { UpdateGenreOutput } from '@core/genre/application/use-cases/update-genre.use-case';
import { UpdateGenreDto } from './dto/update-genre';
import { FindGenreOutput } from '@core/genre/application/use-cases/find-genre.use-case';
import { ListGenresOutput } from '@core/genre/application/use-cases/list-genre.use-case';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';

describe('GenresController Unit Tests', () => {
    let controller: GenresController;

    beforeEach(async () => {
        controller = new GenresController();
    });

    it('should creates a genre', async () => {
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

    it('should updates a genre', async () => {
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

    it('should deletes a category', async () => {
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

    it('should finds a category', async () => {
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

    it('should list categories', async () => {
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
