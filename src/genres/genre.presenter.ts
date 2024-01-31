import {
    GenreCategoryOutputType,
    GenreOutputType,
} from '@core/genre/application/mappers/genre.use-case.output';
import { ListGenresOutput } from '@core/genre/application/use-cases/list-genre.use-case';
import { Transform, Type } from 'class-transformer';
import CollectionPresenter from '../shared/presenters/collection.presenter';

export class GenreCategoryPresenter {
    id: string;
    name: string;
    isActive: boolean;
    //   @Transform(({ value }: { value: Date }) => {
    //     return value.toISOString();
    //   })
    //   created_at: Date;

    constructor(output: GenreCategoryOutputType) {
        this.id = output.id;
        this.name = output.name;
        this.isActive = output.isActive;
    }
}

export class GenrePresenter {
    id: string;
    name: string;
    categoriesId: string[];
    @Type(() => GenreCategoryPresenter)
    categories: GenreCategoryPresenter[];
    // isActive: boolean;
    @Transform(({ value }: { value: Date }) => {
        return value.toISOString();
    })
    createdAt: Date;

    constructor(output: GenreOutputType) {
        this.id = output.id;
        this.name = output.name;
        this.categoriesId = output.categoriesId;
        this.categories = output.categories.map((item) => {
            return new GenreCategoryPresenter(item);
        });
        // this.isActive = output.isActive;
        this.createdAt = output.createdAt;
    }
}

export class GenreCollectionPresenter extends CollectionPresenter {
    @Type(() => GenrePresenter)
    data: GenrePresenter[];

    constructor(output: ListGenresOutput) {
        const { items, ...paginationProps } = output;
        super(paginationProps);
        this.data = items.map((item) => new GenrePresenter(item));
    }
}
