export default class InvalidEntityIdException extends Error {
    constructor(message?: string) {
        super(message || 'Invalid ID.');
        this.name = 'InvalidEntityIdException';
    }
}