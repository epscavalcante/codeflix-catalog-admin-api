import GenreCreatedEvent from '@core/genre/domain/events/genre-created.event';
import IMessageBroker from '@core/shared/application/message-broker/message-broker.interface';
import IDomainEvent from '@core/shared/domain/domain-events/domain-event.interface';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export const EVENTS_CONFIG = {
    [GenreCreatedEvent.name]: {
        exchange: 'amq.direct',
        routingKey: GenreCreatedEvent.name,
    },
    TestEvent: {
        exchange: 'test-exchange',
        routingKey: 'TestEvent',
    },
};

export default class RabbitMQMessageBroker implements IMessageBroker {
    constructor(private amqpConnection: AmqpConnection) {}

    async publishEvent(event: IDomainEvent): Promise<void> {
        const configEvent = EVENTS_CONFIG[event.constructor.name];
        await this.amqpConnection.publish(
            configEvent.exchange,
            configEvent.routingKey,
            event,
        );
    }
}
