import { Chance } from 'chance';
import { CategoryId } from '../../category/domain/category.aggregate';
import GenreId from './genre.id.vo';
import Genre from './genre.aggregate';

type PropOrFactory<T> = T | ((index: number) => T);

export default class GenreFactory<TBuild = any> {
    // auto generated in entity
    private _genreId: PropOrFactory<GenreId> | undefined = undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _name: PropOrFactory<string> = (_index) =>
        this.chance.word({ length: 5 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _categoriesId: PropOrFactory<CategoryId>[] = [];
    // auto generated in entity
    private _createdAt: PropOrFactory<Date> | undefined = undefined;

    private countObjs;

    static aGenre() {
        return new GenreFactory<Genre>();
    }

    static theGenres(countObjs: number) {
        return new GenreFactory<Genre[]>(countObjs);
    }

    private chance: Chance.Chance;

    private constructor(countObjs: number = 1) {
        this.countObjs = countObjs;
        this.chance = Chance();
    }

    withGenreId(valueOrFactory: PropOrFactory<GenreId>) {
        this._genreId = valueOrFactory;
        return this;
    }

    withName(valueOrFactory: PropOrFactory<string>) {
        this._name = valueOrFactory;
        return this;
    }

    addCategoryId(valueOrFactory: PropOrFactory<CategoryId>) {
        this._categoriesId.push(valueOrFactory);
        return this;
    }

    withInvalidNameTooLong(value?: string) {
        this._name = value ?? this.chance.word({ length: 256 });
        return this;
    }

    withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
        this._createdAt = valueOrFactory;
        return this;
    }

    build(): TBuild {
        const Genres = new Array(this.countObjs)
            .fill(undefined)
            .map((_, index) => {
                const categoryId = new CategoryId();
                const categoriesId = this._categoriesId.length
                    ? this.callFactory(this._categoriesId, index)
                    : [categoryId];

                const genre = new Genre({
                    genreId: !this._genreId
                        ? undefined
                        : this.callFactory(this._genreId, index),
                    name: this.callFactory(this._name, index),
                    categoriesId: new Map(
                        categoriesId.map((id) => [id.value, id]),
                    ),
                    ...(this._createdAt && {
                        createdAt: this.callFactory(this._createdAt, index),
                    }),
                });
                genre.validate();
                return genre;
            });
        return this.countObjs === 1 ? (Genres[0] as any) : Genres;
    }

    get genreId() {
        return this.getValue('genreId');
    }

    get name() {
        return this.getValue('name');
    }

    get categoriesId(): CategoryId[] {
        let categoriesId = this.getValue('categoriesId');

        if (!categoriesId.length) {
            categoriesId = [new CategoryId()];
        }
        return categoriesId;
    }

    get createdAt() {
        return this.getValue('createdAt');
    }

    private getValue(prop: any) {
        const optional = ['genreId', 'createdAt'];
        const privateProp = `_${prop}` as keyof this;
        if (!this[privateProp] && optional.includes(prop)) {
            throw new Error(
                `Property ${prop} not have a factory, use 'with' methods`,
            );
        }
        return this.callFactory(this[privateProp], 0);
    }

    private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
        if (typeof factoryOrValue === 'function') {
            return factoryOrValue(index);
        }

        if (factoryOrValue instanceof Array) {
            return factoryOrValue.map((value) =>
                this.callFactory(value, index),
            );
        }

        return factoryOrValue;
    }
}
