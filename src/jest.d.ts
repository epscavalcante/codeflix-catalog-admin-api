import { FieldErrors } from "./domain/validators/validator";

declare global {
    namespace jest {
        interface Matchers<R> {
            containsErrorMessage: (expected: FieldErrors) => R;
        }
    }
}