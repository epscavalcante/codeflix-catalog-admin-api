import { FieldErrors } from '../validator';
import { ValidationError } from './validation.error';

export default class EntityValidationError extends ValidationError {
    constructor(public error: FieldErrors[]) {
        super(error, 'Entity Validation Error');
        this.name = 'EntityValidationError';
    }
}
