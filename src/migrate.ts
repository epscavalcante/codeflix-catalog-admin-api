import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyGlobalConfig } from './app.config.global';
import { MigrationModule } from './database/migration.module';
import { getConnectionToken } from '@nestjs/sequelize';
import { migrator } from './core/infra/migrator'

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(MigrationModule, {
        logger: ['error'],
    });

    const sequelize = app.get(getConnectionToken());

    migrator(sequelize).runAsCLI();
}

bootstrap();
