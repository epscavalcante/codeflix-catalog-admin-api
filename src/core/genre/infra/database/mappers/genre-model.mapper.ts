import Notification from '@core/shared/domain/notification';
import {
    GenreCategoryModel,
    GenreModel,
} from '../sequelize/models/genre.model';
import { CategoryId } from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import GenreId from '@core/genre/domain/genre.id.vo';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';

export class GenreModelMapper {
    static toEntity(model: GenreModel) {
        const { categoriesId = [], ...otherData } = model.toJSON();

        const notification = new Notification();
        if (!categoriesId.length) {
            notification.addError(
                'categoriesId should not be empty',
                'categoriesId',
            );
        }

        const genre = new Genre({
            ...otherData,
            genreId: new GenreId(model.genreId),
            categoriesId: new Map(
                categoriesId.map((c) => {
                    const categoryId = new CategoryId(c.categoryId);

                    return [categoryId.value, categoryId];
                }),
            ),
        });

        genre.validate();

        notification.copyErrors(genre.notification);

        if (notification.hasErrors()) {
            throw new EntityValidationError(notification.toJSON());
        }

        return genre;
    }

    static toModel(entity: Genre) {
        const props = GenreModelMapper.toModelProps(entity);

        return GenreModel.build(props, { include: ['categoriesId'] });
    }

    static toModelProps(genre: Genre) {
        const { categoriesId, ...otherData } = genre.toJSON();
        return {
            ...otherData,
            categoriesId: categoriesId.map(
                (categoryId) =>
                    new GenreCategoryModel({
                        genreId: genre.genreId.value,
                        categoryId,
                    }),
            ),
        };
    }
}
