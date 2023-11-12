import Joi from 'joi';
import { ConfigModule, configDatabaseValidationSchema } from './config.module';
import { Test } from '@nestjs/testing';
import { join } from 'path';

function expectValidate(schema: Joi.Schema, value: any) {
    return expect(
        schema.validate(value, { abortEarly: false })?.error?.message,
    );
}

describe('Config Module Tests', () => {
    describe('Database Validation schema', () => {
        const databaseSchema = Joi.object({
            ...configDatabaseValidationSchema,
        });

        test('Deve validar campos obrigatórios', () => {
            const fieldsRequired = [
                'DB_VENDOR',
                'DB_HOST',
                'DB_LOGGING',
                'DB_AUTO_LOAD_MODELS',
            ];

            fieldsRequired.forEach((field) => {
                expectValidate(databaseSchema, {}).toContain(
                    `"${field}" is required`,
                );
            });
        });

        test('DB_VENDOR - deve ser mysql ou sqlite', () => {
            const supportedVendors = ['mysql', 'sqlite'];

            supportedVendors.forEach((vendor) => {
                expectValidate(databaseSchema, {
                    DB_VENDOR: vendor,
                }).not.toContain('"DB_VENDOR"');
            });

            expectValidate(databaseSchema, { DB_VENDOR: 'postgres' }).toContain(
                '"DB_VENDOR" must be one of [mysql, sqlite]',
            );
        });

        test('Campos obrigatórios quando o DB_VENDOR é mysql', () => {
            const fieldRequiredWhenMysqlDefined = [
                'DB_USERNAME',
                'DB_PASSWORD',
                'DB_PORT',
                'DB_DATABASE',
            ];

            fieldRequiredWhenMysqlDefined.forEach((field) => {
                expectValidate(databaseSchema, {
                    DB_VENDOR: 'mysql',
                }).toContain(`"${field}" is required`);
            });
        });
    });

    it.skip('Deve lançar exceção ao carregar um env invalido', () => {
        try {
            Test.createTestingModule({
                imports: [
                    ConfigModule.forRoot({
                        envFilePath: join(join(__dirname, '.env.fake')),
                    }),
                ],
            });
            fail('ConfigModule carregando env inválido.');
        } catch (e) {
            expect(e.message).toContain(
                '"DB_VENDOR" must be one of [mysql, sqlite]',
            );
        }
    });

    it('should be valid', () => {
        const module = Test.createTestingModule({
            imports: [ConfigModule.forRoot()],
        });

        expect(module).toBeDefined();
    });
});
