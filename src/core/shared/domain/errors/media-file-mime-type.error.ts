export default class MediaFileMimeTypeError extends Error {
    constructor(mimeType: string, validMimeTypes: string[]) {
        super(
            `The mime type must be one of the values: ${validMimeTypes.join(
                ', ',
            )}. Passed value: ${mimeType}`,
        );
    }
}
