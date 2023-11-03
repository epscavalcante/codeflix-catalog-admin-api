import { validateSync } from 'class-validator';
import Notification from './notification';

export type FieldErrors =
    | {
          [field: string]: string[];
      }
    | string;

export interface IValidator {
    validate(notification: Notification, data: any, fields?: string[]): boolean;
}

export abstract class Validator implements IValidator {
    validate(
        notification: Notification,
        data: any,
        fields?: string[],
    ): boolean {
        const errors = validateSync(data, {
            groups: fields,
        });

        if (errors.length) {
            for (const error of errors) {
                Object.values(error.constraints!).forEach((message) =>
                    notification.addError(message, error.property),
                );
            }
        }

        return !errors.length;
    }
}
