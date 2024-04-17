import IIntegrationEvent from '@core/shared/domain/events/integration.event.interface';
import GenreCreatedEvent from './genre-created.event';

export default class GenreCreatedIntegrationEvent implements IIntegrationEvent {
    occurredOn: Date;
    eventVersion: number;
    eventData: any;
    eventName: string;

    constructor(event: GenreCreatedEvent) {
        this.eventName = this.constructor.name;
        this.eventVersion = event.eventVersion;
        this.occurredOn = event.occurredOn;
        this.eventData = {
            genreId: event.genreId.value,
            name: event.name,
        };
    }
}
