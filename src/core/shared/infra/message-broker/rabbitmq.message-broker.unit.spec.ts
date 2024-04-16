import Uuid from '@core/shared/domain/value-objects/uuid.vo';
import RabbitMQMessageBroker, {
    EVENTS_CONFIG,
} from './rabbitmq.message-broker';
import IDomainEvent from '@core/shared/domain/domain-events/domain-event.interface';
import ValueObject from '@core/shared/domain/value-objects/value-object';
import { ChannelWrapper } from 'amqp-connection-manager';

class TestEvent implements IDomainEvent {
    identifier: ValueObject;
    occurredOn: Date;
    eventVersion: number = 1;

    constructor(readonly id: Uuid) {
        this.identifier = id;
    }
}

describe('RabbitMQ Message Broker Unit Tests', () => {
    let service: RabbitMQMessageBroker;
    let connection: ChannelWrapper;

    beforeEach(() => {
        connection = {
            publish: jest.fn(),
        } as any;

        service = new RabbitMQMessageBroker(connection as any);
    });

    describe('Publish message', () => {
        test('Deve publicar um evento em um canal', async () => {
            const event = new TestEvent(new Uuid());

            await service.publishEvent(event);

            expect(connection.publish).toBeCalledWith(
                EVENTS_CONFIG[event.constructor.name].exchange,
                EVENTS_CONFIG[event.constructor.name].routingKey,
                event,
            );
        });
    });
});
