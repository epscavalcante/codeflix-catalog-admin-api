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
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';

export enum AudioVideoMediaRelatedField {
    TRAILER = 'trailer',
    VIDEO = 'video',
}

export type AudioVideoMediaModelProps = {
    audioVideoMediaId: string;
    name: string;
    rawLocation: string;
    encodedLocation: string | null;
    status: AudioVideoMediaStatus;
    videoId: string;
    videoRelatedField: AudioVideoMediaRelatedField;
};

@Table({
    tableName: 'audio_video_medias',
    timestamps: false,
    indexes: [{ fields: ['video_id', 'video_related_field'], unique: true }],
})
export default class AudioVideoMediaModel extends Model<AudioVideoMediaModelProps> {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        field: 'audio_video_media_id',
        defaultValue: () => new Uuid().value,
    })
    declare audioVideoMediaId: string;

    @Column({ allowNull: false, type: DataType.STRING(255) })
    declare name: string;

    @Column({
        allowNull: false,
        field: 'raw_location',
        type: DataType.STRING(255),
    })
    declare rawLocation: string;

    @Column({
        allowNull: true,
        field: 'encoded_location',
        type: DataType.STRING(255),
    })
    declare encodedLocation: string | null;

    @Column({
        allowNull: false,
        type: DataType.ENUM(
            AudioVideoMediaStatus.PENDING,
            AudioVideoMediaStatus.PROCESSING,
            AudioVideoMediaStatus.COMPLETED,
            AudioVideoMediaStatus.FAILED,
        ),
    })
    declare status: AudioVideoMediaStatus;

    @ForeignKey(() => VideoModel)
    @Column({ allowNull: false, field: 'video_id', type: DataType.UUID })
    declare videoId: string;

    @Column({
        allowNull: false,
        field: 'video_related_field',
        type: DataType.ENUM(
            AudioVideoMediaRelatedField.TRAILER,
            AudioVideoMediaRelatedField.VIDEO,
        ),
    })
    declare videoRelatedField: AudioVideoMediaRelatedField;
}
