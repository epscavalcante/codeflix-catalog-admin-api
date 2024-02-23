import { DataType } from 'sequelize-typescript';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import AudioVideoMediaModel, {
    AudioVideoMediaRelatedField,
} from './video-audio-media.model';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';

setupDatabase({ models: [AudioVideoMediaModel] });

describe('Audio Video Media Model Tests', () => {
    test('Check table name', () => {
        expect(AudioVideoMediaModel.getTableName()).toBe('audio_video_medias');
    });
    describe('Check model props', () => {
        test('check defined props ', () => {
            const attributes = AudioVideoMediaModel.getAttributes();
            expect(Object.keys(attributes)).toStrictEqual([
                'audioVideoMediaId',
                'name',
                'rawLocation',
                'encodedLocation',
                'status',
                'videoId',
                'videoRelatedField',
            ]);
        });

        test('check id prop ', () => {
            const attributes = AudioVideoMediaModel.getAttributes();
            expect(attributes.audioVideoMediaId).toMatchObject({
                field: 'audio_video_media_id',
                fieldName: 'audioVideoMediaId',
                primaryKey: true,
                type: DataType.UUID(),
            });
        });

        test('check name prop ', () => {
            const attributes = AudioVideoMediaModel.getAttributes();
            expect(attributes.name).toMatchObject({
                field: 'name',
                fieldName: 'name',
                allowNull: false,
                type: DataType.STRING(255),
            });
        });

        test('check raw location prop ', () => {
            const attributes = AudioVideoMediaModel.getAttributes();
            expect(attributes.rawLocation).toMatchObject({
                field: 'raw_location',
                fieldName: 'rawLocation',
                allowNull: false,
                type: DataType.STRING(255),
            });
        });

        test('check encoded location prop ', () => {
            const attributes = AudioVideoMediaModel.getAttributes();
            expect(attributes.encodedLocation).toMatchObject({
                field: 'encoded_location',
                fieldName: 'encodedLocation',
                allowNull: false,
                type: DataType.STRING(255),
            });
        });

        test('check videoId prop ', () => {
            const attributes = AudioVideoMediaModel.getAttributes();
            expect(attributes.videoId).toMatchObject({
                field: 'video_id',
                fieldName: 'videoId',
                allowNull: false,
                type: DataType.UUID(),
            });
        });

        test('check status prop ', () => {
            const attributes = AudioVideoMediaModel.getAttributes();
            expect(attributes.status).toMatchObject({
                field: 'status',
                fieldName: 'status',
                allowNull: false,
                type: DataType.ENUM(
                    AudioVideoMediaStatus.PENDING,
                    AudioVideoMediaStatus.PROCESSING,
                    AudioVideoMediaStatus.COMPLETED,
                    AudioVideoMediaStatus.FAILED,
                ),
            });
        });

        test('check videoRelatedField prop ', () => {
            const attributes = AudioVideoMediaModel.getAttributes();
            expect(attributes.videoRelatedField).toMatchObject({
                field: 'video_related_field',
                fieldName: 'videoRelatedField',
                allowNull: false,
                type: DataType.ENUM(
                    AudioVideoMediaRelatedField.TRAILER,
                    AudioVideoMediaRelatedField.VIDEO,
                ),
            });
        });
    });
});
