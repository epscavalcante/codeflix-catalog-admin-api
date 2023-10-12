import Category from "../../../domain/entities/category.entity";
import { CategorySearchResult } from "../../../domain/repositories/category.repository";
import CategoryMemoryRespository from "../../../infra/repositories/category-memory.repository";
import ListCategoryUseCase from "./list-category.use-case";
import CategoryOutput from "../mappers/category-output";

describe("List categories Unit Test", () => {
    let useCase: ListCategoryUseCase;
    let repository: CategoryMemoryRespository;

    beforeEach(() => {
        repository = new CategoryMemoryRespository();
        useCase = new ListCategoryUseCase(repository);
    });

    test("Deve retornar o output sem alteração", async () => {
        const result = new CategorySearchResult({
            currentPage: 1,
            perPage: 1,
            total: 1,
            items: [],
        });

        const output = useCase["toOutput"](result);

        expect(output).toStrictEqual({
            items: [],
            currentPage: 1,
            total: 1,
            perPage: 1,
            lastPage: 1,
        });
    });

    test("Deve retornar output com um item sem filtros, ordenação ou paginação", async () => {
        const category = Category.fake().aCategory().build();

        const result = new CategorySearchResult({
            currentPage: 1,
            perPage: 1,
            total: 1,
            items: [category],
        });

        const output = useCase["toOutput"](result);

        expect(output).toStrictEqual({
            items: [category].map((item) => CategoryOutput.toOutput(item)),
            currentPage: 1,
            total: 1,
            perPage: 1,
            lastPage: 1,
        });
    });

    test("Retorna o output ordenado por padrão usando CreatedAt", async () => {
        const categories = [
            Category.fake()
                .aCategory()
                .withName("Test 1")
                .withCreatedAt(new Date(new Date().getTime() + 100))
                .build(),
            Category.fake()
                .aCategory()
                .withName("Test 2")
                .withCreatedAt(new Date(new Date().getTime() + 200))
                .build(),
        ];

        repository.items = categories;

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

    test("Deve retornar o output filtrado, ordenado e paginado", async () => {
        const cats = [
            Category.fake().aCategory().withName("a").build(),
            Category.fake().aCategory().withName("hello").build(),
            Category.fake().aCategory().withName("AAA").build(),
            Category.fake().aCategory().withName("world").build(),
            Category.fake().aCategory().withName("AaA").build(),
        ];

        repository.items = cats;

        const output = await useCase.handle({
            page: 1,
            perPage: 2,
            sort: "name",
            filter: "a",
        });

        expect(output).toStrictEqual({
            items: [cats[2], cats[4]].map((item) =>
                CategoryOutput.toOutput(item)
            ),
            currentPage: 1,
            total: 3,
            perPage: 2,
            lastPage: 2,
        });
    });
});
