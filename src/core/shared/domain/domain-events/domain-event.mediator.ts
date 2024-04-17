import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../aggregate-root';

export default class DomainEventMediator {
    constructor(private eventEmmit: EventEmitter2) {}

    register(eventName: string, handler: any) {
        this.eventEmmit.on(eventName, handler);
    }

    async publish(aggregateRoot: AggregateRoot) {
        for (const event of aggregateRoot.getUndispatchedEvent()) {
            aggregateRoot.markEventAsDispatched(event);
            await this.eventEmmit.emitAsync(event.constructor.name, event);
        }
    }

    async publishIntegrationEvents(aggregateRoot: AggregateRoot) {
        for (const event of aggregateRoot.events) {
            const integrationEvent = event.getIntegrationEvent?.();
            if (!integrationEvent) continue;
            await this.eventEmmit.emitAsync(
                integrationEvent.constructor.name,
                integrationEvent,
            );
        }
    }
}
