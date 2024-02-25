export default class FileNotFoundError extends Error {
    constructor(id: string) {
        super(`File ${id} not found`);
        this.name = 'FileNotFoundError';
    }
}
