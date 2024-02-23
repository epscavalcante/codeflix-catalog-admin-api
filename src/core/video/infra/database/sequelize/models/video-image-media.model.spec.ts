import { DataType } from 'sequelize-typescript';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import VideoImageMediaModel, {
    ImageMediaRelatedField,
} from './video-image-media.model';

setupDatabase({ models: [VideoImageMediaModel] });

describe('Video Image Model Tests', () => {
    test('Check table name', () => {
        expect(VideoImageMediaModel.getTableName()).toBe('video_image_medias');
    });
    describe('Check model props', () => {
        test('check defined props ', () => {
            const attributes = VideoImageMediaModel.getAttributes();
            expect(Object.keys(attributes)).toStrictEqual([
                'videoImageId',
                'name',
                'location',
                'videoId',
                'videoRelatedField',
            ]);
        });

        test('check id prop ', () => {
            const attributes = VideoImageMediaModel.getAttributes();
            expect(attributes.videoImageMediaId).toMatchObject({
                field: 'video_image_media_id',
                fieldName: 'videoImageMediaId',
                primaryKey: true,
                type: DataType.UUID(),
            });
        });

        test('check name prop ', () => {
            const attributes = VideoImageMediaModel.getAttributes();
            expect(attributes.name).toMatchObject({
                field: 'name',
                fieldName: 'name',
                allowNull: false,
                type: DataType.STRING(255),
            });
        });

        test('check location prop ', () => {
            const attributes = VideoImageMediaModel.getAttributes();
            expect(attributes.location).toMatchObject({
                field: 'location',
                fieldName: 'location',
                allowNull: false,
                type: DataType.STRING(255),
            });
        });

        test('check videoId prop ', () => {
            const attributes = VideoImageMediaModel.getAttributes();
            expect(attributes.videoId).toMatchObject({
                field: 'video_id',
                fieldName: 'videoId',
                allowNull: false,
                type: DataType.UUID(),
            });
        });
        test('check videoRelatedField prop ', () => {
            const attributes = VideoImageMediaModel.getAttributes();
            expect(attributes.videoRelatedField).toMatchObject({
                field: 'video_related_field',
                fieldName: 'videoRelatedField',
                allowNull: false,
                type: DataType.ENUM(
                    ImageMediaRelatedField.BANNER,
                    ImageMediaRelatedField.THUMBNAIL,
                    ImageMediaRelatedField.THUMBNAIL_HALF,
                ),
            });
        });
    });
});
