import CategoryModel from "../models/sequelize/category.model";
import { Sequelize } from "sequelize-typescript";
import CategorySequelizeRepository from "./category-sequelize.repository";
import Category from "../../domain/entities/category.entity";
import Uuid from "../../domain/value-objects/uuid.vo";
import EntityNotFoundException from "../../domain/exceptions/entity-not-found.exception";
import {
    CategorySearchParams,
    CategorySearchResult,
} from "../../domain/repositories/category.repository.interface";
import CategoryMapper from "../mappers/category.mapper";
import { setupDatabase } from '../helpers/setup-database';

describe("Category Sequelize Repository Tests", () => {
    let repository: CategorySequelizeRepository;

    setupDatabase({ models:  [CategoryModel] });

    beforeEach(async () => {
        repository = new CategorySequelizeRepository(CategoryModel);
    });

    test("Should insert a new category", async () => {
        const category = Category.fake().aCategory().build();

        await repository.insert(category);

        const categoryInserted = await CategoryModel.findByPk(
            category.categoryId.value
        );

        expect(categoryInserted.toJSON()).toMatchObject({
            categoryId: category.categoryId.value,
            name: category.name,
            description: category.description,
            isActive: category.isActive,
            createdAt: category.createdAt,
        });
    });

    describe("Finds category by Id", () => {
        test("Should return null when category not exist", async () => {
            const categoryModel = await repository.findById(new Uuid());

            expect(categoryModel).toBeNull();
        });

        test("Should return category founded", async () => {
            const categoryModel = Category.fake().aCategory().build();
            await repository.insert(categoryModel);

            const categoryModelFounded = await repository.findById(
                categoryModel.categoryId
            );

            expect(categoryModel.toJSON()).toMatchObject(
                categoryModelFounded.toJSON()
            );
        });
    });

    test("Should return all categories", async () => {
        const categoriesModel = Category.fake().theCategories(5).build();

        await repository.bulkInsert(
            categoriesModel.map((categoriesModel) => {
                return new Category({
                    categoryId: categoriesModel.categoryId,
                    name: categoriesModel.name,
                    description: categoriesModel.description,
                    isActive: categoriesModel.isActive,
                    createdAt: categoriesModel.createdAt,
                });
            })
        );

        const allCategories = await repository.findAll();

        expect(allCategories).toHaveLength(5);
        expect(JSON.stringify(allCategories)).toStrictEqual(
            JSON.stringify(categoriesModel)
        );
    });

    test("Should bulk insert categories", async () => {
        const categories = Category.fake().theCategories(3).build();

        await repository.bulkInsert(categories);

        const { count } = await CategoryModel.findAndCountAll();

        expect(categories).toHaveLength(3);
    });

    describe("Update category", () => {
        test("Should throws exception when category not found", async () => {
            const category = Category.fake().aCategory().build();

            await expect(repository.update(category)).rejects.toThrow(
                new EntityNotFoundException(category.categoryId, Category)
            );
        });

        test("Should updates category", async () => {
            const category = Category.fake()
                .aCategory()
                .withDescription(null)
                .build();
            await repository.insert(category);

            category.changeDescription("description updated");
            await repository.update(category);

            const categoryUpdated = await repository.findById(
                category.categoryId
            );
            expect(categoryUpdated.toJSON()).toStrictEqual(category.toJSON());
        });
    });

    describe("Delete category", () => {
        test("Should throws exception when category not found", async () => {
            const category = Category.fake().aCategory().build();

            await expect(
                repository.delete(category.categoryId)
            ).rejects.toThrow(
                new EntityNotFoundException(category.categoryId, Category)
            );
        });

        test("Should delete category", async () => {
            const category = Category.fake()
                .aCategory()
                .withDescription(null)
                .build();
            await repository.insert(category);

            await repository.delete(category.categoryId);

            const categoryDeleted = await repository.findById(
                category.categoryId
            );
            expect(categoryDeleted).toBeNull();
        });
    });

    describe("Search categories", () => {
        it("should only apply paginate when other params are null", async () => {
            const createdAt = new Date();
            const categories = Category.fake()
                .theCategories(16)
                .withName("Movie")
                .withDescription(null)
                .withCreatedAt(createdAt)
                .build();
            await repository.bulkInsert(categories);
            const spyToEntity = jest.spyOn(CategoryMapper, "toEntity");

            const searchOutput = await repository.search(
                new CategorySearchParams()
            );
            expect(searchOutput).toBeInstanceOf(CategorySearchResult);
            expect(spyToEntity).toHaveBeenCalledTimes(15);
            expect(searchOutput.toJSON()).toMatchObject({
                total: 16,
                currentPage: 1,
                lastPage: 2,
                perPage: 15,
            });
            searchOutput.items.forEach((item) => {
                expect(item).toBeInstanceOf(Category);
                expect(item.categoryId).toBeDefined();
            });
            const items = searchOutput.items.map((item) => item.toJSON());
            expect(items).toMatchObject(
                new Array(15).fill({
                    name: "Movie",
                    description: null,
                    isActive: true,
                    createdAt: createdAt,
                })
            );
        });

        it("should order by createdAt DESC when search params are null", async () => {
            const createdAt = new Date();
            const categories = Category.fake()
                .theCategories(16)
                .withName((index) => `Movie ${index}`)
                .withDescription(null)
                .withCreatedAt((index) => new Date(createdAt.getTime() + index))
                .build();
            const searchOutput = await repository.search(
                new CategorySearchParams()
            );
            const items = searchOutput.items;
            [...items].reverse().forEach((item, index) => {
                expect(`Movie ${index}`).toBe(`${categories[index + 1].name}`);
            });
        });

        it("should apply paginate and filter", async () => {
            const categories = [
                Category.fake()
                    .aCategory()
                    .withName("test")
                    .withCreatedAt(new Date(new Date().getTime() + 5000))
                    .build(),
                Category.fake()
                    .aCategory()
                    .withName("a")
                    .withCreatedAt(new Date(new Date().getTime() + 4000))
                    .build(),
                Category.fake()
                    .aCategory()
                    .withName("TEST")
                    .withCreatedAt(new Date(new Date().getTime() + 3000))
                    .build(),
                Category.fake()
                    .aCategory()
                    .withName("TeSt")
                    .withCreatedAt(new Date(new Date().getTime() + 1000))
                    .build(),
            ];

            await repository.bulkInsert(categories);

            let searchOutput = await repository.search(
                new CategorySearchParams({
                    page: 1,
                    perPage: 2,
                    filter: "TEST",
                })
            );

            expect(searchOutput.toJSON(true)).toMatchObject(
                new CategorySearchResult({
                    items: [categories[0], categories[2]],
                    total: 3,
                    currentPage: 1,
                    perPage: 2,
                }).toJSON(true)
            );

            searchOutput = await repository.search(
                new CategorySearchParams({
                    page: 2,
                    perPage: 2,
                    filter: "TEST",
                })
            );
            expect(searchOutput.toJSON(true)).toMatchObject(
                new CategorySearchResult({
                    items: [categories[3]],
                    total: 3,
                    currentPage: 2,
                    perPage: 2,
                }).toJSON(true)
            );
        });

        it("should apply paginate and sort", async () => {
            expect(repository.sortableFields).toStrictEqual([
                "name",
                "createdAt",
            ]);

            const categories = [
                Category.fake().aCategory().withName("b_____").build(),
                Category.fake().aCategory().withName("a_____").build(),
                Category.fake().aCategory().withName("d_____").build(),
                Category.fake().aCategory().withName("e_____").build(),
                Category.fake().aCategory().withName("c_____").build(),
            ];
            await repository.bulkInsert(categories);

            const arrange = [
                {
                    params: new CategorySearchParams({
                        page: 1,
                        perPage: 2,
                        sort: "name",
                    }),
                    result: new CategorySearchResult({
                        items: [categories[1], categories[0]],
                        total: 5,
                        currentPage: 1,
                        perPage: 2,
                    }),
                },
                {
                    params: new CategorySearchParams({
                        page: 2,
                        perPage: 2,
                        sort: "name",
                    }),
                    result: new CategorySearchResult({
                        items: [categories[4], categories[2]],
                        total: 5,
                        currentPage: 2,
                        perPage: 2,
                    }),
                },
                {
                    params: new CategorySearchParams({
                        page: 1,
                        perPage: 2,
                        sort: "name",
                        sortDir: "desc",
                    }),
                    result: new CategorySearchResult({
                        items: [categories[3], categories[2]],
                        total: 5,
                        currentPage: 1,
                        perPage: 2,
                    }),
                },
                {
                    params: new CategorySearchParams({
                        page: 2,
                        perPage: 2,
                        sort: "name",
                        sortDir: "desc",
                    }),
                    result: new CategorySearchResult({
                        items: [categories[4], categories[0]],
                        total: 5,
                        currentPage: 2,
                        perPage: 2,
                    }),
                },
            ];

            for (const i of arrange) {
                const result = await repository.search(i.params);
                expect(result.toJSON(true)).toMatchObject(
                    i.result.toJSON(true)
                );
            }
        });

        describe("should search using filter, sort and paginate", () => {
            const categories = [
                Category.fake().aCategory().withName("test").build(),
                Category.fake().aCategory().withName("a").build(),
                Category.fake().aCategory().withName("TEST").build(),
                Category.fake().aCategory().withName("e").build(),
                Category.fake().aCategory().withName("TeSt").build(),
            ];

            const arrange = [
                {
                    search_params: new CategorySearchParams({
                        page: 1,
                        perPage: 2,
                        sort: "name",
                        filter: "TEST",
                    }),
                    search_result: new CategorySearchResult({
                        items: [categories[2], categories[4]],
                        total: 3,
                        currentPage: 1,
                        perPage: 2,
                    }),
                },
                {
                    search_params: new CategorySearchParams({
                        page: 2,
                        perPage: 2,
                        sort: "name",
                        filter: "TEST",
                    }),
                    search_result: new CategorySearchResult({
                        items: [categories[0]],
                        total: 3,
                        currentPage: 2,
                        perPage: 2,
                    }),
                },
            ];

            beforeEach(async () => {
                await repository.bulkInsert(categories);
            });

            test.each(arrange)(
                "when value is $search_params",
                async ({ search_params, search_result }) => {
                    const result = await repository.search(search_params);
                    expect(result.toJSON(true)).toMatchObject(
                        search_result.toJSON(true)
                    );
                }
            );
        });
    });
});
