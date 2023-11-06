import { FieldErrors } from '../validator';

export abstract class ValidationError extends Error {
    constructor(
        public error: FieldErrors[],
        message = 'Validation Error',
    ) {
        super(message);
    }

    setFromError(field: string, error: Error) {
        if (error) {
            this.error[field] = [error.message];
        }
    }

    count() {
        return Object.keys(this.error).length;
    }
}

// export class ValidationError extends Error {}
