export default interface IIntegrationEvent<T = any> {
    occurredOn: Date;
    eventVersion: number;
    eventData: T;
    eventName: string;
}
