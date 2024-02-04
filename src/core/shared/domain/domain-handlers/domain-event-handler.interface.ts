import IDomainEvent from '../domain-events/domain-event.interface';

export default interface IDomainEventHandler {
    handle(event: IDomainEvent): Promise<void>;
}
