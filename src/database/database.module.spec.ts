import { Test } from '@nestjs/testing';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from './database.module';
import { getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

describe('Database Module Tests', () => {
    describe('SQLITE Connection', () => {
        const sqliteConnectionConfig = {
            DB_VENDOR: 'sqlite',
            DB_HOST: ':memory:',
            DB_LOGGING: false,
            DB_AUTO_LOAD_MODELS: true,
        };

        test('Deve iniciar a aplicação com sqlite', async () => {
            const module = await Test.createTestingModule({
                imports: [
                    DatabaseModule,
                    ConfigModule.forRoot({
                        isGlobal: true,
                        ignoreEnvFile: true,
                        ignoreEnvVars: true,
                        validationSchema: null,
                        load: [() => sqliteConnectionConfig],
                    }),
                ],
            }).compile();

            const app = module.createNestApplication();
            const connection = app.get<Sequelize>(getConnectionToken());
            expect(connection).toBeDefined();
            expect(connection.options.dialect).toBe('sqlite');
            expect(connection.options.host).toBe(':memory:');
            await connection.close();
        });
    });

    describe('MySQL Connection', () => {
        const mysqlConnectionConfig = {
            DB_VENDOR: 'mysql',
            DB_HOST: 'db_tests',
            DB_DATABASE: 'catalog',
            DB_USERNAME: 'root',
            DB_PASSWORD: 'root',
            DB_PORT: 3306,
            DB_LOGGING: false,
            DB_AUTO_LOAD_MODELS: true,
        };

        test('Deve iniciar a aplicação com sqlite', async () => {
            const module = await Test.createTestingModule({
                imports: [
                    DatabaseModule,
                    ConfigModule.forRoot({
                        isGlobal: true,
                        ignoreEnvFile: true,
                        ignoreEnvVars: true,
                        validationSchema: null,
                        load: [() => mysqlConnectionConfig],
                    }),
                ],
            }).compile();

            const app = module.createNestApplication();
            const connection = app.get<Sequelize>(getConnectionToken());
            expect(connection).toBeDefined();
            expect(connection.options.dialect).toBe('mysql');
            expect(connection.options.host).toBe('db_tests');
            expect(connection.options.database).toBe('catalog');
            expect(connection.options.port).toBe(3306);
            expect(connection.options.username).toBe('root');
            expect(connection.options.password).toBe('root');
            await connection.close();
        });
    });
});
