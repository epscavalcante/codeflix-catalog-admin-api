import ValueObject from '../value-objects/value-object';

export default interface IDomainEvent {
    identifier: ValueObject;
    occurredOn: Date;
    eventVersion: number;
}
