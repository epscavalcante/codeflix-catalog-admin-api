import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';
import Video from '../video.aggregate';

export default class VideoNotFoundError extends EntityNotFoundError {
    constructor(id: string) {
        super(id, Video);
    }
}
