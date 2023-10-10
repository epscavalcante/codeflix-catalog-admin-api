import { DataType } from "sequelize-typescript";
import CategoryModel from "./category.model";
import { setupDatabase } from "../../helpers/setup-database";

describe("Category Model Test", () => {
    
    setupDatabase({ models:  [CategoryModel] });

    describe("Check model props", () => {
        test("check defined props ", () => {
            const attributes = CategoryModel.getAttributes();

            expect(Object.keys(attributes)).toStrictEqual([
                "categoryId",
                "name",
                "description",
                "isActive",
                "createdAt",
            ]);
        });

        test("check id prop ", () => {
            const attributes = CategoryModel.getAttributes();

            expect(attributes.categoryId).toMatchObject({
                field: "category_id",
                fieldName: "categoryId",
                primaryKey: true,
                type: DataType.UUID(),
            });
        });

        test("check name prop ", () => {
            const attributes = CategoryModel.getAttributes();

            expect(attributes.name).toMatchObject({
                field: "name",
                fieldName: "name",
                allowNull: false,
                type: DataType.STRING(255),
            });
        });

        test("check description prop ", () => {
            const attributes = CategoryModel.getAttributes();

            expect(attributes.description).toMatchObject({
                field: "description",
                fieldName: "description",
                allowNull: true,
                type: DataType.TEXT(),
            });
        });

        test("check isActive prop ", () => {
            const attributes = CategoryModel.getAttributes();

            expect(attributes.isActive).toMatchObject({
                field: "is_active",
                fieldName: "isActive",
                allowNull: false,
                type: DataType.BOOLEAN(),
            });
        });

        test("check createdAt prop ", () => {
            const attributes = CategoryModel.getAttributes();

            expect(attributes.createdAt).toMatchObject({
                field: "created_at",
                fieldName: "createdAt",
                allowNull: false,
                type: DataType.DATE(3),
            });
        });
    });

    test("Should create a category", async () => {
        const data = {
            categoryId: "3e3b4710-bf7c-49a8-b49f-788d42ff2e90",
            name: "naova",
            description: "li si vo.",
            isActive: true,
            createdAt: new Date(),
        };
        const categoryModel = await CategoryModel.create(data);

        expect(categoryModel.toJSON()).toStrictEqual(data);
    });
});
