import { CategoriesController } from './categories.controller';
import { CreateCategoryOutput } from '@core/category/application/use-cases/create-category.use-case';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryPresenter } from './categories.presenter';
import { UpdateCategoryOutput } from '@core/category/application/use-cases/update-category.use-case';
import { UpdateCategoryInput } from '@core/category/application/use-cases/mappers/update-category-input.use-case';

describe('CategoriesController Unit Tests', () => {
    let controller: CategoriesController;

    beforeEach(() => {
        controller = new CategoriesController();
    });

    test('Deve criar uma categoria', async () => {
        const categoryCreatedOutput: CreateCategoryOutput = {
            id: '1234',
            name: 'category',
            description: 'description',
            isActive: false,
            createdAt: new Date(),
        };

        const mockCreateCategoryUseCase = {
            handle: jest
                .fn()
                .mockReturnValue(Promise.resolve(categoryCreatedOutput)),
        };
        //@ts-expect-error define method mock
        controller['createCategoryUseCase'] = mockCreateCategoryUseCase;

        const createCategoryDto: CreateCategoryDto = {
            name: 'category',
            description: 'description',
            isActive: false,
        };

        const categoryCreatedOutputPresenter =
            await controller.create(createCategoryDto);

        expect(mockCreateCategoryUseCase.handle).toHaveBeenCalledTimes(1);
        expect(mockCreateCategoryUseCase.handle).toHaveBeenCalledWith(
            createCategoryDto,
        );
        expect(categoryCreatedOutputPresenter).toBeInstanceOf(
            CategoryPresenter,
        );
        expect(categoryCreatedOutputPresenter).toStrictEqual(
            new CategoryPresenter(categoryCreatedOutput),
        );
    });

    test('Deve remover uma categoria', async () => {
        const expectedResponse = undefined;
        const mockDeleteCategoryUseCase = {
            handle: jest
                .fn()
                .mockReturnValue(Promise.resolve(expectedResponse)),
        };

        //@ts-expect-error define method mock
        controller['deleteCategoryUseCase'] = mockDeleteCategoryUseCase;

        const id = '12345';

        const categoryDeletedOutputPresenter = await controller.remove(id);

        expect(mockDeleteCategoryUseCase.handle).toHaveBeenCalledTimes(1);
        expect(mockDeleteCategoryUseCase.handle).toHaveBeenCalledWith({ id });
        expect(categoryDeletedOutputPresenter).toStrictEqual(undefined);
    });

    test('Deve encontrar uma categoria', async () => {
        const id = '123456';

        const findCategoryPresenter: CategoryPresenter = {
            id,
            name: 'category',
            description: 'description',
            isActive: false,
            createdAt: new Date(),
        };

        const mockFindCategoryUseCase = {
            handle: jest
                .fn()
                .mockReturnValue(Promise.resolve(findCategoryPresenter)),
        };

        //@ts-expect-error define method mock
        controller['findCategoryUseCase'] = mockFindCategoryUseCase;

        const categoryFoundOutputPresenter = await controller.findOne(id);

        expect(mockFindCategoryUseCase.handle).toHaveBeenCalledTimes(1);
        expect(mockFindCategoryUseCase.handle).toHaveBeenCalledWith({ id });
        expect(categoryFoundOutputPresenter).toStrictEqual(
            new CategoryPresenter(findCategoryPresenter),
        );
    });

    test('Deve atualizar uma categoria', async () => {
        const id = '123456';

        const updateCategoryOutput: UpdateCategoryOutput = {
            id,
            name: 'category',
            description: 'description',
            isActive: false,
            createdAt: new Date(),
        };

        const mockUpdateCategoryUseCase = {
            handle: jest
                .fn()
                .mockReturnValue(Promise.resolve(updateCategoryOutput)),
        };

        const input: Omit<UpdateCategoryInput, 'id'> = {
            name: 'category',
            description: 'description',
            isActive: true,
        };

        //@ts-expect-error define method mock
        controller['updateCategoryUseCase'] = mockUpdateCategoryUseCase;

        const categoryUpdatedOutputPresenter = await controller.update(
            id,
            input,
        );

        expect(mockUpdateCategoryUseCase.handle).toHaveBeenCalledTimes(1);
        expect(mockUpdateCategoryUseCase.handle).toHaveBeenCalledWith({
            id,
            ...input,
        });
        expect(categoryUpdatedOutputPresenter).toStrictEqual(
            new CategoryPresenter(updateCategoryOutput),
        );
    });
});
