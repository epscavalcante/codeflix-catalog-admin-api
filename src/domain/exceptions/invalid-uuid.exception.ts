export default class InvalidUuidException extends Error {
    constructor(message?: string) {
        super(message || 'Invalid Uuid.');
        this.name = 'InvalidUuidException';
    }
}