import { Transform } from 'class-transformer';
import { CategoryOutputType } from '@core/category/application/use-cases/mappers/category-output';

import { ListCategoryOutput } from '@core/category/application/use-cases/list-category.use-case';
import CollectionPresenter from '../shared/presenters/collection.presenter';

export class CategoryCollectionPresenter extends CollectionPresenter {
    data: CategoryPresenter[];

    constructor(output: ListCategoryOutput) {
        const { items, ...paginationProps } = output;

        super(paginationProps);
        this.data = items.map((item) => new CategoryPresenter(item));
    }
}

export class CategoryPresenter {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;

    @Transform(({ value }: { value: Date }) => value.toISOString())
    createdAt: Date;

    constructor(output: CategoryOutputType) {
        this.id = output.id;
        this.name = output.name;
        this.description = output.description;
        this.isActive = output.isActive;
        this.createdAt = output.createdAt;
    }
}
