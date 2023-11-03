import { FieldErrors } from "../validator";

export default class EntityValidationException extends Error {
    constructor(
        public error: FieldErrors[], 
        message = 'Entity Validation Error'
    ) {
        super(message);
    }
}