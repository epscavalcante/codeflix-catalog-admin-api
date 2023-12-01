import ValueObject from '../../shared/domain/value-objects/value-object';
// import { GenreValidatorFactory } from './category.validator';
// import GenreFactory from './category.factory';
import { AggregateRoot } from '../../shared/domain/aggregate-root';
import GenreId from './genre.id.vo';
import GenreFactory from './genre.factory';
import GenreValidator from './genre.validator';
import { CategoryId } from '@core/category/domain/category.aggregate';

export type GenreConstrutorProps = {
    genreId?: GenreId;
    name: string;
    categoriesId: Map<string, CategoryId>;
    createdAt?: Date;
};

export type GenreStaticCreateProps = {
    name: string;
    categoriesId: CategoryId[];
};

export default class Genre extends AggregateRoot {
    genreId: GenreId;
    name: string;
    categoriesId: Map<string, CategoryId>;
    createdAt: Date;

    constructor(props: GenreConstrutorProps) {
        super();
        this.genreId = props.genreId ?? new GenreId();
        this.name = props.name;
        this.categoriesId = props.categoriesId;
        this.createdAt = props.createdAt ?? new Date();
    }

    static create(props: GenreStaticCreateProps): Genre {
        const genre = new Genre({
            ...props,
            categoriesId: new Map(
                props.categoriesId.map((categoryId) => [
                    categoryId.value,
                    categoryId,
                ]),
            ),
        });

        genre.validate(['name']);

        return genre;
    }

    addCategoryId(categoryId: CategoryId) {
        this.categoriesId.set(categoryId.value, categoryId);
    }

    removeCategoryId(categoryId: CategoryId) {
        this.categoriesId.delete(categoryId.value);
    }

    changeName(name: string): void {
        this.name = name;

        this.validate(['name']);
    }

    validate(fields?: string[]) {
        const genreValidator = new GenreValidator();

        return genreValidator.validate(this.notification, this, fields);
    }

    syncCategoriesId(categoriesId: CategoryId[]) {
        if (!categoriesId.length) {
          throw new Error('Categories ID is empty');
        }
    
        this.categoriesId = new Map(
          categoriesId.map((categoryId) => [categoryId.value, categoryId]),
        );
      }

    toJSON() {
        return {
            genreId: this.genreId.value,
            name: this.name,
            categoriesId: Array.from(this.categoriesId.values()).map(categoryId => categoryId.value),
            createdAt: this.createdAt,
        };
    }

    static fake() {
        return GenreFactory;
    }

    get entityId(): ValueObject {
        return this.genreId;
    }
}
