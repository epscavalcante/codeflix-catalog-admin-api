import { DataTypes, Sequelize } from 'sequelize';
import type { MigrationFn } from 'umzug';

const tableName = 'cast_members';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().createTable(tableName, {
        cast_member_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        type: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE(3),
            allowNull: false,
        },
    });
};
export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().dropTable(tableName);
};
