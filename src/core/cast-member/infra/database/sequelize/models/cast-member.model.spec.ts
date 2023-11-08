import { DataType } from 'sequelize-typescript';
import CastMemberModel from './cast-member.model';
import { setupDatabase } from '@core/shared/infra/database/setup-database';
import { CastMemberTypeEnum } from '@core/cast-member/domain/cast-member-type.value-object';

describe('Category Model Test', () => {
    setupDatabase({ models: [CastMemberModel] });

    describe('Check model props', () => {
        test('check defined props ', () => {
            const attributes = CastMemberModel.getAttributes();

            expect(Object.keys(attributes)).toStrictEqual([
                'castMemberId',
                'name',
                'type',
                'createdAt',
            ]);
        });

        test('check id prop ', () => {
            const attributes = CastMemberModel.getAttributes();

            expect(attributes.castMemberId).toMatchObject({
                field: 'cast_member_id',
                fieldName: 'castMemberId',
                primaryKey: true,
                type: DataType.UUID(),
            });
        });

        test('check name prop ', () => {
            const attributes = CastMemberModel.getAttributes();

            expect(attributes.name).toMatchObject({
                field: 'name',
                fieldName: 'name',
                allowNull: false,
                type: DataType.STRING(255),
            });
        });

        test('check type prop ', () => {
            const attributes = CastMemberModel.getAttributes();

            expect(attributes.type).toMatchObject({
                field: 'type',
                fieldName: 'type',
                allowNull: false,
                type: DataType.TINYINT(),
            });
        });

        test('check createdAt prop ', () => {
            const attributes = CastMemberModel.getAttributes();

            expect(attributes.createdAt).toMatchObject({
                field: 'created_at',
                fieldName: 'createdAt',
                allowNull: false,
                type: DataType.DATE(3),
            });
        });
    });

    test('Should create a cast member', async () => {
        const data = {
            castMemberId: '3e3b4710-bf7c-49a8-b49f-788d42ff2e90',
            name: 'cast member',
            type: CastMemberTypeEnum.ACTOR,
            createdAt: new Date(),
        };
        const castMemberModel = await CastMemberModel.create(data);

        expect(castMemberModel.toJSON()).toStrictEqual(data);
    });
});
