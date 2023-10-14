import { CategoryRules } from "./category.rules";
import Notification from "./notiification";
import { Validator } from "./validator";

export default class CategoryValidator extends Validator {
    validate(
        notification: Notification,
        data: any,
        fields?: string[]
    ): boolean {
        const newFields = fields?.length ? fields : ["name"];

        return super.validate(notification, new CategoryRules(data), newFields);
    }
}

export class CategoryValidatorFactory {
    static create() {
        return new CategoryValidator();
    }
}
