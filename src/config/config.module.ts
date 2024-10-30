import { Module } from '@nestjs/common';
import {
    ConfigModuleOptions,
    ConfigModule as NestConfigModule,
} from '@nestjs/config';
import Joi from 'joi';
import { join } from 'path';

//@ts-expect-error - check
const joiJson = Joi.extend((joi) => {
    return {
        type: 'object',
        base: joi.object(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        coerce(value, _schema) {
            if (value[0] !== '{' && !/^\s*\{/.test(value)) return;
            try {
                return { value: JSON.parse(value) };
            } catch (error) {
                console.error(error);
            }
        },
    };
});

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

type GoogleCloudStorageSchemaType = {
    GOOGLE_CLOUD_STORAGE_CREDENTIALS: object;
    GOOGLE_CLOUD_STORAGE_BUCKET_NAME: string;
};

export const configGoogleCloudStorageValidationSchema: Joi.StrictSchemaMap<GoogleCloudStorageSchemaType> =
    {
        GOOGLE_CLOUD_STORAGE_CREDENTIALS: joiJson.object().required(),
        GOOGLE_CLOUD_STORAGE_BUCKET_NAME: Joi.string().required(),
    };

type MinioStorageSchemaType = {
    MINIO_ACCESS_KEY: string;
    MINIO_SECRET_KEY: string;
    MINIO_BUCKET_NAME: string;
};

export const configMinioStorageValidationSchema: Joi.StrictSchemaMap<MinioStorageSchemaType> =
    {
        MINIO_ACCESS_KEY: joiJson.string().required(),
        MINIO_SECRET_KEY: Joi.string().required(),
        MINIO_BUCKET_NAME: Joi.string().required(),
    };

type JWTSchemaType = {
    JWT_PRIVATE_KEY: string;
    JWT_PUBLIC_KEY: string;
};

export const configJwtSchemaValidationSchema: Joi.StrictSchemaMap<JWTSchemaType> =
    {
        JWT_PRIVATE_KEY: joiJson.string().optional(),
        JWT_PUBLIC_KEY: Joi.string().required(),
    };

@Module({})
export class ConfigModule extends NestConfigModule {
    static forRoot(options: ConfigModuleOptions = {}) {
        const { envFilePath, ...otherProps } = options;

        return super.forRoot({
            isGlobal: true,
            envFilePath: [
                ...(Array.isArray(envFilePath) ? envFilePath : [envFilePath!]),
                join(process.cwd(), `.env.${process.env.NODE_ENV}`),
                join(process.cwd(), `.env`),
            ],
            validationSchema: Joi.object({
                ...configDatabaseValidationSchema,
                ...configGoogleCloudStorageValidationSchema,
                ...configMinioStorageValidationSchema,
                ...configJwtSchemaValidationSchema,
            }),
            ...otherProps,
        });
    }
}
