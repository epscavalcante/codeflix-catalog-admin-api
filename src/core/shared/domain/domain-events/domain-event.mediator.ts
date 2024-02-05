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
}
