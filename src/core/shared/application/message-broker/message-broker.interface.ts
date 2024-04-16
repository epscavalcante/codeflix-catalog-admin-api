import IDomainEvent from '@core/shared/domain/domain-events/domain-event.interface';

export default interface IMessageBroker {
    publishEvent(event: IDomainEvent): Promise<void>;
}
