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
import { RatingClassifications } from '@core/video/domain/video-rating.vo';
import { GenreModel } from '@core/genre/infra/database/sequelize/models/genre.model';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import VideoImageMediaModel from './video-image-media.model';
import AudioVideoMediaModel from './video-audio-media.model';

export type VideoModelProps = {
    videoId: string;
    title: string;
    description: string;
    yearLaunched: number;
    duration: number;
    rating: RatingClassifications;
    isOpened: boolean;
    isPublished: boolean;

    imageMedias: VideoImageMediaModel[];
    audioVideoMedias: AudioVideoMediaModel[];

    categoriesId: VideoCategoryModel[];
    categories?: CategoryModel[];
    genresId: VideoGenreModel[];
    genres?: CategoryModel[];
    castMembersId: VideoCastMemberModel[];
    castMembers?: CastMemberModel[];
    createdAt: Date;
};

@Table({ tableName: 'videos', timestamps: false })
export default class VideoModel extends Model<VideoModelProps> {
    @PrimaryKey
    @Column({ type: DataType.UUID, field: 'video_id' })
    declare videoId: string;

    @Column({ allowNull: false, type: DataType.STRING(255) })
    declare title: string;

    @Column({ allowNull: false, type: DataType.TEXT })
    declare description: string;

    @Column({
        allowNull: false,
        field: 'year_launched',
        type: DataType.SMALLINT,
    })
    declare yearLaunched: number;

    @Column({ allowNull: false, type: DataType.SMALLINT })
    declare duration: number;

    @Column({
        allowNull: false,
        type: DataType.ENUM(
            RatingClassifications.RL,
            RatingClassifications.R10,
            RatingClassifications.R12,
            RatingClassifications.R14,
            RatingClassifications.R16,
            RatingClassifications.R18,
        ),
    })
    declare rating: RatingClassifications;

    @Column({ allowNull: false, field: 'is_opened', type: DataType.BOOLEAN })
    declare isOpened: boolean;

    @Column({ allowNull: false, field: 'is_published', type: DataType.BOOLEAN })
    declare isPublished: boolean;

    @HasMany(() => VideoImageMediaModel, 'video_id')
    declare imageMedias: VideoImageMediaModel[];

    @HasMany(() => AudioVideoMediaModel, 'video_id')
    declare audioVideoMedias: AudioVideoMediaModel[];

    @HasMany(() => VideoCategoryModel, 'videoId')
    declare categoriesId: VideoCategoryModel[];

    @BelongsToMany(() => CategoryModel, () => VideoCategoryModel)
    declare categories: CategoryModel[];

    @HasMany(() => VideoGenreModel, 'videoId')
    declare genresId: VideoGenreModel[];

    @BelongsToMany(() => GenreModel, () => VideoGenreModel)
    declare genres: GenreModel[];

    @HasMany(() => VideoCastMemberModel, 'videoId')
    declare castMembersId: VideoCastMemberModel[];

    @BelongsToMany(() => CastMemberModel, () => VideoCastMemberModel)
    declare castMembers: CastMemberModel[];

    @Column({ allowNull: false, field: 'created_at', type: DataType.DATE(3) })
    declare createdAt: Date;
}

export type VideoCategoryModelProps = {
    videoId: string;
    categoryId: string;
};

@Table({ tableName: 'category_video', timestamps: false })
export class VideoCategoryModel extends Model<VideoCategoryModelProps> {
    @PrimaryKey
    @ForeignKey(() => VideoModel)
    @Column({ type: DataType.UUID, field: 'video_id' })
    declare videoId: string;
    @PrimaryKey
    @ForeignKey(() => CategoryModel)
    @Column({ type: DataType.UUID, field: 'category_id' })
    declare categoryId: string;
}

export type VideoGenreModelProps = {
    videoId: string;
    genreId: string;
};

@Table({ tableName: 'genre_video', timestamps: false })
export class VideoGenreModel extends Model<VideoGenreModelProps> {
    @PrimaryKey
    @ForeignKey(() => VideoModel)
    @Column({ type: DataType.UUID, field: 'video_id' })
    declare videoId: string;
    @PrimaryKey
    @ForeignKey(() => GenreModel)
    @Column({ type: DataType.UUID, field: 'genre_id' })
    declare genreId: string;
}

export type VideoCastMemberModelProps = {
    videoId: string;
    castMemberId: string;
};

@Table({ tableName: 'cast_member_video', timestamps: false })
export class VideoCastMemberModel extends Model<VideoCastMemberModelProps> {
    @PrimaryKey
    @ForeignKey(() => VideoModel)
    @Column({ type: DataType.UUID, field: 'video_id' })
    declare videoId: string;
    @PrimaryKey
    @ForeignKey(() => CastMemberModel)
    @Column({ type: DataType.UUID, field: 'cast_member_id' })
    declare castMemberId: string;
}
