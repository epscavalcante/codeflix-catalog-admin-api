import IDomainEvent from '@core/shared/domain/domain-events/domain-event.interface';
import GenreId from '../genre.id.vo';

type GenreCreatedEventProps = {
    genreId: GenreId;
    name: string;
    createdAt: Date;
};

export default class GenreCreatedEvent implements IDomainEvent {
    readonly identifier: GenreId;
    readonly occurredOn: Date = new Date();
    readonly eventVersion: number = 1;

    readonly genreId: GenreId;
    readonly name: string;
    readonly createdAt: Date;

    constructor(props: GenreCreatedEventProps) {
        this.identifier = props.genreId;
        this.name = props.name;
        this.createdAt = props.createdAt;
    }
}
