import { AggregateRoot } from './aggregate-root';
import IDomainEvent from './domain-events/domain-event.interface';
import Uuid from './value-objects/uuid.vo';
import ValueObject from './value-objects/value-object';

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

        this.registerHandler(
            StubNameUpdatedEvent.name,
            this.onNameUpdated.bind(this),
        );
    }

    toJSON() {
        return {
            id: this.aggregateId.value,
            name: this.name,
        };
    }

    get entityId(): ValueObject {
        return this.aggregateId;
    }

    updateName(name: string) {
        this.name = name;
        this.applyEvent(new StubNameUpdatedEvent(this.aggregateId, this.name));
    }

    onNameUpdated(event: StubNameUpdatedEvent) {
        this.name = event.name;
    }
}

describe('Aggregate root Unit Test', () => {
    test('Dispatch event', () => {
        const identifier = new Uuid();
        const aggregate = new StubAggregateRoot(identifier, 'name');
        aggregate.updateName('name updated');
        expect(aggregate.name).toBe('name updated');
    });
});
