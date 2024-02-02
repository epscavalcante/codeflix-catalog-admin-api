import Notification from '../../shared/domain/notification';
import { Validator } from '../../shared/domain/validator';
import GenreRules from './genre.rules';

export default class GenreValidator extends Validator {
    validate(
        notification: Notification,
        data: any,
        fields?: string[],
    ): boolean {
        const newFields = fields?.length ? fields : ['name'];

        return super.validate(notification, new GenreRules(data), newFields);
    }
}
