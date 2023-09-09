import { FieldErrors } from "domain/validators/validator";

export default class EntityValidationError extends Error {
    constructor(
        public error: FieldErrors, 
        message = 'Entity Validation Error'
    ) {
        super(message);
    }
}