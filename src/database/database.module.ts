import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { ConfigSchemaType } from '../config/config.module';
import CategoryModel from '../core/category/infra/database/sequelize/models/category.model';
import CastMemberModel from '../core/cast-member/infra/database/sequelize/models/cast-member.model';

const models = [CategoryModel, CastMemberModel];

@Module({
    imports: [
        SequelizeModule.forRootAsync({
            useFactory: (configService: ConfigService<ConfigSchemaType>) => {
                const dbVendor = configService.get('DB_VENDOR');

                if (dbVendor === 'sqlite') {
                    return {
                        dialect: 'sqlite',
                        host: configService.get('DB_HOST'),
                        logging: configService.get('DB_LOGGING'),
                        autoLoadModels: configService.get(
                            'DB_AUTO_LOAD_MODELS',
                        ),
                        models,
                    };
                }

                if (dbVendor === 'mysql') {
                    return {
                        dialect: 'mysql',
                        host: configService.get('DB_HOST'),
                        port: configService.get('DB_PORT'),
                        database: configService.get('DB_DATABASE'),
                        username: configService.get('DB_USERNAME'),
                        password: configService.get('DB_PASSWORD'),
                        logging: configService.get('DB_LOGGING'),
                        autoLoadModels: configService.get(
                            'DB_AUTO_LOAD_MODELS',
                        ),
                        models,
                    };
                }

                throw new Error(`Unsupported database config. ${dbVendor}`);
            },
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {}
