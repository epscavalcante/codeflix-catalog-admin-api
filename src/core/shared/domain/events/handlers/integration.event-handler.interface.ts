import IIntegrationEvent from '../integration.event.interface';

export default interface IIntegrationEventHandler {
    handle(event: IIntegrationEvent): Promise<void>;
}
