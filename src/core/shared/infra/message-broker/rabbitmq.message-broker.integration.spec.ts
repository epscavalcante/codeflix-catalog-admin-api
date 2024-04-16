import Uuid from '@core/shared/domain/value-objects/uuid.vo';
import RabbitMQMessageBroker from './rabbitmq.message-broker';
import IDomainEvent from '@core/shared/domain/domain-events/domain-event.interface';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import Config from '../config';
import { ConsumeMessage } from 'amqplib';

class TestEvent implements IDomainEvent {
    occurredOn: Date;
    eventVersion: number = 1;

    constructor(readonly identifier: Uuid) {}
}

describe('RabbitMQ Message Broker Integration Tests', () => {
    let service: RabbitMQMessageBroker;
    let connection: AmqpConnection;

    beforeEach(async () => {
        connection = new AmqpConnection({
            uri: Config.rabbitmqUri(),
            connectionInitOptions: {
                wait: true,
            },
            logger: {
                debug: () => {},
                error: () => {},
                warn: () => {},
                log: () => {},
            },
        });
        await connection.init();
        const channel = connection.channel;
        await channel.assertExchange('test-exchange', 'direct', {
            durable: false,
        });
        await channel.assertQueue('test-queue', { durable: false });
        await channel.purgeQueue('test-queue');
        await channel.bindQueue('test-queue', 'test-exchange', 'TestEvent');
        service = new RabbitMQMessageBroker(connection);
    });

    afterEach(async () => {
        try {
            await connection.managedConnection.close();
        } catch (error) {}
    });

    describe('Publish message', () => {
        test('Deve publicar um evento em um canal', async () => {
            const event = new TestEvent(new Uuid());
            await service.publishEvent(event);
            const consumeMessage: ConsumeMessage = await new Promise(
                (resolve) => {
                    connection.channel.consume('test-queue', (message) =>
                        resolve(message),
                    );
                },
            );
            const message = JSON.parse(consumeMessage.content.toString());
            expect(message).toEqual({
                identifier: { value: event.identifier.value },
                eventVersion: 1,
            });
        });
    });
});
