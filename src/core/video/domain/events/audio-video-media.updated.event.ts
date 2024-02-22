import IDomainEvent from '@core/shared/domain/domain-events/domain-event.interface';
import ValueObject from '@core/shared/domain/value-objects/value-object';
import VideoTrailer from '../video-trailer.vo';
import { VideoId } from '../video.aggregate';
import VideoMedia from '../video-media.vo';

type AudioVideoMediaEventContructorProps = {
    identifier: VideoId;
    media: VideoTrailer | VideoMedia;
    mediaType: 'trailer' | 'video';
};

export default class AudioVideoMediaUpdatedEvent implements IDomainEvent {
    identifier: ValueObject;
    occurredOn: Date;
    eventVersion: number;

    readonly media: VideoTrailer | VideoMedia;
    readonly mediaType: 'trailer' | 'video';

    constructor(props: AudioVideoMediaEventContructorProps) {
        this.eventVersion = 1;
        this.occurredOn = new Date();
        this.mediaType = props.mediaType;
        this.media = props.media;
        this.identifier = props.identifier;
    }
}
