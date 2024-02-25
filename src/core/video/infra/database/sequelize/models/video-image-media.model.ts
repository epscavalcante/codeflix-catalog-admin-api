import {
    Column,
    DataType,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript';
import VideoModel from './video.model';
import Uuid from '@core/shared/domain/value-objects/uuid.vo';

export enum ImageMediaRelatedField {
    BANNER = 'banner',
    THUMBNAIL = 'thumbnail',
    THUMBNAIL_HALF = 'thumbnail_half',
}

export type VideoImageMediaModelProps = {
    videoImageMediaId: string;
    name: string;
    location: string;
    videoId: string;
    videoRelatedField: ImageMediaRelatedField;
};

@Table({
    tableName: 'video_image_medias',
    timestamps: false,
    indexes: [{ fields: ['video_id', 'video_related_field'], unique: true }],
})
export default class VideoImageMediaModel extends Model<VideoImageMediaModelProps> {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        field: 'video_image_media_id',
        defaultValue: () => new Uuid().value,
    })
    declare videoImageMediaId: string;

    @Column({ allowNull: false, type: DataType.STRING(255) })
    declare name: string;

    @Column({ allowNull: false, type: DataType.STRING(255) })
    declare location: string;

    @ForeignKey(() => VideoModel)
    @Column({ allowNull: false, field: 'video_id', type: DataType.UUID })
    declare videoId: string;

    @Column({
        allowNull: false,
        field: 'video_related_field',
        type: DataType.ENUM(
            ImageMediaRelatedField.BANNER,
            ImageMediaRelatedField.THUMBNAIL,
            ImageMediaRelatedField.THUMBNAIL_HALF,
        ),
    })
    declare videoRelatedField: ImageMediaRelatedField;
}
