import { DataTypes, Sequelize } from 'sequelize';
import type { MigrationFn } from 'umzug';

const tableName = 'category_video';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().createTable(tableName, {
        videoId: {
            field: 'video_id',
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        categoryId: {
            field: 'category_id',
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
    });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().dropTable(tableName);
};
