import { config as readEnv } from 'dotenv';
import { join } from 'path';

export default class Config {
    static env: any = null;

    static database() {
        Config.readEnv();

        return {
            dialect: Config.env.DB_VENDOR,
            host: Config.env.DB_HOST,
            logging: Config.env.DB_LOGGING === 'true',
        };
    }

    static bucketName() {
        Config.readEnv();

        return Config.env.GOOGLE_CLOUD_STORAGE_BUCKET_NAME;
    }

    static googleCredentials() {
        Config.readEnv();

        return JSON.parse(Config.env.GOOGLE_CLOUD_CREDENTIALS);
    }

    static rabbitmqUri() {
        Config.readEnv();

        return Config.env.RABBITMQ_URI;
    }

    static readEnv() {
        if (Config.env) {
            return;
        }

        const { parsed } = readEnv({
            path: join(
                __dirname,
                `../../../../../.env.${process.env.NODE_ENV}`,
            ),
        });

        Config.env = {
            ...parsed,
            ...process.env,
        };
    }
}
