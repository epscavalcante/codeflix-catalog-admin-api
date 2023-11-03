import { NestFactory, Reflector } from '@nestjs/core';
import { MigrationModule } from './database/migration.module';
import { getConnectionToken } from '@nestjs/sequelize';
import { migrator } from './core/shared/infra/database/sequelize/migrator'

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(MigrationModule, {
        logger: ['error'],
    });

    const sequelize = app.get(getConnectionToken());

    migrator(sequelize).runAsCLI();
}

bootstrap();
