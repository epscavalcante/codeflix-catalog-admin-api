import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { SharedModule } from './shared/shared.module';
import { CastMembersModule } from './cast-members/cast-members.module';
import { GenresModule } from './genres/genres.module';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { ApplicationModule } from './application/application.module';
import { VideosModule } from './videos/videos.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitmqfakeController } from './rabbitmqfake/rabbitmqfake.controller';
import RabbitMQFakeConsumer from './rabbitmq-fake.consumer';

@Module({
    imports: [
        ConfigModule.forRoot(),
        SharedModule,
        DatabaseModule,
        AuthModule,
        EventModule,
        ApplicationModule,
        CategoriesModule,
        CastMembersModule,
        GenresModule,
        VideosModule,
        RabbitMQModule.forRoot(RabbitMQModule, {
            uri: 'amqp://admin:admin@172.17.0.5:5672',
        }),
    ],
    providers: [RabbitMQFakeConsumer],
    controllers: [RabbitmqfakeController],
})
export class AppModule {}
