import { DataTypes, Sequelize } from 'sequelize';
import type { MigrationFn } from 'umzug';

const tableName = 'genre_video';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().createTable(tableName, {
        videoId: {
            field: 'video_id',
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        genreId: {
            field: 'genre_id',
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
    });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().dropTable(tableName);
};
