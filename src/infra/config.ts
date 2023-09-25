import { config as readEnv } from "dotenv";
import { join } from "path";

export default class Config {
    static env: any = null;

    static database() {
        Config.readEnv();

        return {
            dialect: Config.env.DB_VENDOR,
            host: Config.env.DB_HOST,
            logging: Config.env.DB_LOGGING === "true",
        };
    }

    static readEnv() {
        if (Config.env) {
            return;
        }
        Config.env = readEnv({
            path: join(__dirname, `../../.env.${process.env.NODE_ENV}`),
        }).parsed;
    }
}
