import Category from "../../../domain/entities/category.aggregate";

export type CategoryOutputType = {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
};

export default class CategoryOutput {
    static toOutput(category: Category): CategoryOutputType {
        const { categoryId, ...props } = category.toJSON();

        return {
            id: categoryId.value,
            ...props,
        };
    }
}
