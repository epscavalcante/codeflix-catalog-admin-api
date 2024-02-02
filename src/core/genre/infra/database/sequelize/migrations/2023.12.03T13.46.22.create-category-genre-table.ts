import { DataTypes, Sequelize } from 'sequelize';
import type { MigrationFn } from 'umzug';

const tableName = 'category_genre';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().createTable(tableName, {
        genre_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        category_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
    });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().dropTable(tableName);
};
