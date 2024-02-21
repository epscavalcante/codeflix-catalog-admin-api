export default class MediaFileMimeTypeError extends Error {
    constructor(mimeType: string, validMimeTypes: string[]) {
        super(
            `Media file mime type (${mimeType}) not exist in ${validMimeTypes.join(
                ', ',
            )}`,
        );
    }
}
