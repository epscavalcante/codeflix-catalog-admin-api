import { ListGenresOutput } from '@core/genre/application/use-cases/list-genre.use-case';
import { Transform, Type } from 'class-transformer';
import CollectionPresenter from '../shared/presenters/collection.presenter';

export default class VideoPresenter {
    id: string;
    title: string;
    // categoriesId: string[];
    // @Type(() => GenreCategoryPresenter)
    // categories: GenreCategoryPresenter[];
    // isActive: boolean;
    @Transform(({ value }: { value: Date }) => {
        return value.toISOString();
    })
    createdAt: Date;

    constructor(output: any) {
        this.id = output.id;
        this.title = output.title;
        // this.categoriesId = output.categoriesId;
        // this.categories = output.categories.map((item) => {
        //     return new GenreCategoryPresenter(item);
        // });
        // this.isActive = output.isActive;
        this.createdAt = output.createdAt;
    }
}

// export class VideoCategoryPresenter {
//     id: string;
//     name: string;
//     isActive: boolean;
//     //   @Transform(({ value }: { value: Date }) => {
//     //     return value.toISOString();
//     //   })
//     //   created_at: Date;

//     constructor(output: GenreCategoryOutputType) {
//         this.id = output.id;
//         this.name = output.name;
//         this.isActive = output.isActive;
//     }
// }

// export class VideoGenrePresenter {
//     id: string;
//     name: string;
//     isActive: boolean;
//     //   @Transform(({ value }: { value: Date }) => {
//     //     return value.toISOString();
//     //   })
//     //   created_at: Date;

//     constructor(output: GenreCategoryOutputType) {
//         this.id = output.id;
//         this.name = output.name;
//         this.isActive = output.isActive;
//     }
// }

// export class VideoCastMemberPresenter {
//     id: string;
//     name: string;
//     type: 1 | 2;
//     //   @Transform(({ value }: { value: Date }) => {
//     //     return value.toISOString();
//     //   })
//     //   created_at: Date;

//     constructor(output: VideoCastMembers) {
//         this.id = output.id;
//         this.name = output.name;
//         this.type = output.type;
//     }
// }

export class GenreCollectionPresenter extends CollectionPresenter {
    @Type(() => VideoPresenter)
    data: VideoPresenter[];

    constructor(output: ListGenresOutput) {
        const { items, ...paginationProps } = output;
        super(paginationProps);
        this.data = items.map((item) => new VideoPresenter(item));
    }
}
