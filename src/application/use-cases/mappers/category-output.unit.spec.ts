import Category from "../../../domain/entities/category.entity";
import CategoryOutput from "./category-output";

describe("Category Usecases Output Unit Test", () => {
    test("Deve converter categoria para output do usecase", () => {
        const category = Category.fake()
            .aCategory()
            .withName("Teste")
            .withDescription("Description")
            .deactivate()
            .build();

        const spyToJson = jest.spyOn(category, "toJSON");

        const output = CategoryOutput.toOutput(category);

        expect(spyToJson).toHaveBeenCalled();
        expect(output).toStrictEqual({
            id: category.categoryId.value,
            name: category.name,
            description: category.description,
            isActive: category.isActive,
            createdAt: category.createdAt,
        });
    });
});
