import GenreCreatedEvent from '@core/genre/domain/events/genre-created.event';
import IDomainEventHandler from '@core/shared/domain/domain-handlers/domain-event-handler.interface';
import { OnEvent } from '@nestjs/event-emitter';

export default class PublishGenreInQueueHandler implements IDomainEventHandler {
    @OnEvent(GenreCreatedEvent.name)
    async handle(event: GenreCreatedEvent): Promise<void> {
        console.log('handler', event);
    }
}
