import {
    BelongsToMany,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';

export type GenreModelProps = {
    genreId: string;
    name: string;
    categoriesId?: GenreCategoryModel[];
    categories?: CategoryModel[];
    createdAt: Date;
};

@Table({ tableName: 'genres', timestamps: false })
export class GenreModel extends Model<GenreModelProps> {
    @PrimaryKey
    @Column({ type: DataType.UUID, field: 'genre_id' })
    declare genreId: string;

    @Column({ allowNull: false, type: DataType.STRING(255) })
    declare name: string;

    @HasMany(() => GenreCategoryModel, 'genreId')
    declare categoriesId: GenreCategoryModel[];

    @BelongsToMany(() => CategoryModel, () => GenreCategoryModel)
    declare categories: CategoryModel[];

    @Column({ allowNull: false, field: 'created_at', type: DataType.DATE(3) })
    declare createdAt: Date;
}

export type GenreCategoryModelProps = {
    genreId: string;
    categoryId: string;
};

@Table({ tableName: 'category_genre', timestamps: false })
export class GenreCategoryModel extends Model<GenreCategoryModelProps> {
    @PrimaryKey
    @ForeignKey(() => GenreModel)
    @Column({ type: DataType.UUID, field: 'genre_id' })
    declare genreId: string;

    @PrimaryKey
    @ForeignKey(() => CategoryModel)
    @Column({ type: DataType.UUID, field: 'category_id' })
    declare categoryId: string;
}
