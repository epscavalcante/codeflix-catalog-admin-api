import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';

export type GenreOutputType = {
    id: string;
    name: string;
    categories: GenreCategoryOutputType[];
    categoriesId: string[];
    createdAt: Date;
};

export type GenreCategoryOutputType= {
    id: string;
    name: string;
    isActive: boolean;
}

export default class GenreOutputMapper {
    static toOutput(genre: Genre, categories: Category[]): GenreOutputType {
        return {
            id: genre.genreId.value,
            name: genre.name,
            createdAt: genre.createdAt,
            categories: categories.map(category => ({
                id: category.categoryId.value,
                name: category.name,
                isActive: category.isActive
            })),
            categoriesId: categories.map(category => category.categoryId.value),
        }
    }
}
