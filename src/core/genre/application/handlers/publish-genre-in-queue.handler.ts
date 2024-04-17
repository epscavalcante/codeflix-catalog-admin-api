import GenreCreatedIntegrationEvent from '@core/genre/domain/events/genre-created.integration-event';
import IIntegrationEventHandler from '@core/shared/domain/events/handlers/integration.event-handler.interface';
import { OnEvent } from '@nestjs/event-emitter';

export default class PublishGenreInQueueHandler
    implements IIntegrationEventHandler
{
    @OnEvent(GenreCreatedIntegrationEvent.name)
    async handle(event: GenreCreatedIntegrationEvent): Promise<void> {
        console.log('handler', event);
    }
}
