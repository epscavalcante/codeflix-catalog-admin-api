import { Module } from '@nestjs/common';
import {
    ConfigModuleOptions,
    ConfigModule as NestConfigModule,
} from '@nestjs/config';
import Joi from 'joi';
import { join } from 'path';

type DatabaseSchemaType = {
    DB_VENDOR: 'mysql' | 'sqlite';
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    DB_LOGGING: boolean;
    DB_AUTO_LOAD_MODELS: boolean;
};

export type ConfigSchemaType = DatabaseSchemaType;

export const configDatabaseValidationSchema: Joi.StrictSchemaMap<DatabaseSchemaType> =
    {
        DB_VENDOR: Joi.string().required().valid('mysql', 'sqlite'),
        DB_HOST: Joi.string().required(),
        DB_DATABASE: Joi.string().when('DB_VENDOR', {
            is: 'mysql',
            then: Joi.required(),
        }),
        DB_USERNAME: Joi.string().when('DB_VENDOR', {
            is: 'mysql',
            then: Joi.required(),
        }),
        DB_PASSWORD: Joi.string().when('DB_VENDOR', {
            is: 'mysql',
            then: Joi.required(),
        }),
        DB_PORT: Joi.number().integer().when('DB_VENDOR', {
            is: 'mysql',
            then: Joi.required(),
        }),
        DB_LOGGING: Joi.boolean().required(),
        DB_AUTO_LOAD_MODELS: Joi.boolean().required(),
    };

@Module({})
export class ConfigModule extends NestConfigModule {
    static forRoot(options: ConfigModuleOptions = {}) {
        const { envFilePath, ...otherProps } = options;
        return super.forRoot({
            isGlobal: true,
            envFilePath: [
                ...(Array.isArray(envFilePath) ? envFilePath : [envFilePath]),
                join(process.cwd(), `.env.${process.env.NODE_ENV}`),
                join(process.cwd(), `.env`),
            ],
            validationSchema: Joi.object({
                ...configDatabaseValidationSchema,
            }),
            ...otherProps,
        });
    }
}
