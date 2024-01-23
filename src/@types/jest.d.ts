import { FieldErrors } from '@core/shared/domain/validator';

declare global {
    namespace jest {
        interface Matchers<R> {
            notificationContainsErrorMessages: (
                expected: Array<FieldErrors>,
            ) => R;
        }
    }
}
