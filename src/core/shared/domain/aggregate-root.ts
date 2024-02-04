import IDomainEvent from './domain-events/domain-event.interface';
import Entity from './entity';
import EventEmitter2 from 'eventemitter2';
export abstract class AggregateRoot extends Entity {
    events: Set<IDomainEvent> = new Set<IDomainEvent>();
    private dispatchedEvents: Set<IDomainEvent> = new Set<IDomainEvent>();

    localMediator: EventEmitter2 = new EventEmitter2();

    applyEvent(event: IDomainEvent) {
        this.events.add(event);
        this.localMediator.emit(event.constructor.name, event);
    }

    registerHandler(eventName: string, handler: (event: IDomainEvent) => void) {
        this.localMediator.on(eventName, handler);
    }

    markEventAsDispatched(event: IDomainEvent) {
        this.dispatchedEvents.add(event);
    }

    getUndispatchedEvent(): IDomainEvent[] {
        return Array.from(this.events).filter(
            (event) => !this.dispatchedEvents.has(event),
        );
    }

    resetEvents() {
        this.events.clear();
        this.dispatchedEvents.clear();
    }
}
