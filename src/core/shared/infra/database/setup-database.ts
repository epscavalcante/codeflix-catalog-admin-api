import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import Config from './config';

export function setupDatabase(options: SequelizeOptions = {}) {
    let _sequelize: Sequelize;

    beforeAll(async () => {
        const databaseConfig = Config.database();

        _sequelize = new Sequelize({
            ...databaseConfig,
            ...options,
        });
    });

    beforeEach(async () => await _sequelize.sync({ force: true }));

    afterAll(async () => await _sequelize.close());

    return {
        get sequelize() {
            return _sequelize;
        },
    };
}
