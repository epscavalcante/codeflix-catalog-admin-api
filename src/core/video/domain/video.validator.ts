import Notification from '../../shared/domain/notification';
import { Validator } from '../../shared/domain/validator';
import VideoRules from './video.rules';

export default class VideoValidator extends Validator {
    validate(
        notification: Notification,
        data: any,
        fields?: string[],
    ): boolean {
        const newFields = fields?.length ? fields : ['title'];

        return super.validate(notification, new VideoRules(data), newFields);
    }
}
