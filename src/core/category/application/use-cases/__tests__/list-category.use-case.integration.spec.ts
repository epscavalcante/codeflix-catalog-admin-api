import Category from '../../../../category/domain/category.aggregate';
import { CategorySearchResult } from '../../../../category/domain/category.repository.interface';
import CategorySequelizeRespository from '../../../infra/repositories/category-sequelize.repository';
import ListCategoryUseCase from '../list-category.use-case';
import CategoryOutput from '../mappers/category-output';
import { setupDatabase } from '../../../../shared/infra/database/setup-database';
import CategoryModel from '../../../infra/database/sequelize/models/category.model';

describe('List categories Integration Test', () => {
    let useCase: ListCategoryUseCase;
    let repository: CategorySequelizeRespository;

    setupDatabase({ models: [CategoryModel] });

    beforeEach(() => {
        repository = new CategorySequelizeRespository(CategoryModel);
        useCase = new ListCategoryUseCase(repository);
    });

    test('Deve retornar o output sem alteração', async () => {
        const result = new CategorySearchResult({
            currentPage: 1,
            perPage: 1,
            total: 1,
            items: [],
        });

        const output = useCase['toOutput'](result);

        expect(output).toStrictEqual({
            items: [],
            currentPage: 1,
            total: 1,
            perPage: 1,
            lastPage: 1,
        });
    });

    test('Deve retornar output com um item sem filtros, ordenação ou paginação', async () => {
        const category = Category.fake().aCategory().build();

        repository.insert(category);

        const result = new CategorySearchResult({
            currentPage: 1,
            perPage: 1,
            total: 1,
            items: [category],
        });

        const output = useCase['toOutput'](result);

        expect(output).toStrictEqual({
            items: [category].map((item) => CategoryOutput.toOutput(item)),
            currentPage: 1,
            total: 1,
            perPage: 1,
            lastPage: 1,
        });
    });

    test('Retorna o output ordenado por padrão usando CreatedAt', async () => {
        const categories = [
            Category.fake()
                .aCategory()
                .withName('Test 1')
                .withCreatedAt(new Date(new Date().getTime() + 100))
                .build(),
            Category.fake()
                .aCategory()
                .withName('Test 2')
                .withCreatedAt(new Date(new Date().getTime() + 200))
                .build(),
        ];

        repository.bulkInsert(categories);

        const output = await useCase.handle({});

        expect(output).toStrictEqual({
            items: categories
                .reverse()
                .map((item) => CategoryOutput.toOutput(item)),
            currentPage: 1,
            total: 2,
            perPage: 15,
            lastPage: 1,
        });
    });

    test('Deve retornar o output filtrado, ordenado e paginado', async () => {
        const categories = [
            Category.fake().aCategory().withName('a').build(),
            Category.fake().aCategory().withName('hello').build(),
            Category.fake().aCategory().withName('AAA').build(),
            Category.fake().aCategory().withName('world').build(),
            Category.fake().aCategory().withName('AaA').build(),
        ];

        repository.bulkInsert(categories);

        const output = await useCase.handle({
            page: 1,
            perPage: 2,
            sort: 'name',
            filter: 'a',
        });

        expect(output).toStrictEqual({
            items: [categories[2], categories[4]].map((item) =>
                CategoryOutput.toOutput(item),
            ),
            currentPage: 1,
            total: 3,
            perPage: 2,
            lastPage: 2,
        });
    });
});
