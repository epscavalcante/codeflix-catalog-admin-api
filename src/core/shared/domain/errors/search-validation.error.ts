import { FieldErrors } from '../validator';
import { ValidationError } from './validation.error';

export class SearchValidationError extends ValidationError {
    constructor(error: FieldErrors[]) {
        super(error, 'Search Validation Error');
        this.name = 'SearchValidationError';
    }
}
