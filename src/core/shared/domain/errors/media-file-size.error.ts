export default class MediaFileSizeError extends Error {
    constructor(size: number, maxSize: number) {
        super(
            `Media file size (${size}) must be less than or equal to ${maxSize}`,
        );
    }
}
