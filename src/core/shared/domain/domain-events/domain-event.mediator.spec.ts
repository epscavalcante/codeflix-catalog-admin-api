import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../aggregate-root';
import Uuid from '../value-objects/uuid.vo';
import DomainEventMediator from './domain-event.mediator';
import IDomainEvent from './domain-event.interface';

class StubNameUpdatedEvent implements IDomainEvent {
    eventVersion: number = 1;
    occurredOn: Date;
    constructor(
        public identifier: Uuid,
        public name: string,
    ) {
        this.occurredOn = new Date();
        this.name;
    }
}

class StubAggregateRoot extends AggregateRoot {
    aggregateId: Uuid;
    name: string;

    constructor(aggregateId: Uuid, name: string) {
        super();
        this.aggregateId = aggregateId;
        this.name = name;
    }

    toJSON() {
        return {
            id: this.aggregateId.value,
            name: this.name,
        };
    }

    get entityId() {
        return this.aggregateId;
    }

    updateName(name: string) {
        this.name = name;
        this.applyEvent(new StubNameUpdatedEvent(this.aggregateId, this.name));
    }
}

describe('DomainEventMediator UnitTests', () => {
    let domainEventMediator: DomainEventMediator;

    beforeEach(() => {
        const eventemitter2: EventEmitter2 = new EventEmitter2();
        domainEventMediator = new DomainEventMediator(eventemitter2);
    });

    test('Deve publicar os eventos', async () => {
        expect.assertions(1);
        domainEventMediator.register(
            StubNameUpdatedEvent.name,
            (event: StubNameUpdatedEvent) => {
                expect(event.name).toBe('name updated');
            },
        );
        const aggregate = new StubAggregateRoot(new Uuid(), 'name');
        aggregate.updateName('name updated');
        await domainEventMediator.publish(aggregate);
    });
});
