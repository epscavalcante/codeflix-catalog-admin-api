import MediaFileMimeTypeError from '../errors/media-file-mime-type.error';
import MediaFileSizeError from '../errors/media-file-size.error';
import crypto from 'crypto';

export default class MediaFileValidator {
    constructor(
        private readonly maxSize: number,
        private readonly validMimeTypes: string[],
    ) {}

    validate(rawName: string, mimeType: string, size: number) {
        if (!this.validateSize(size))
            throw new MediaFileSizeError(size, this.maxSize);
        if (!this.validateMimeType(mimeType))
            throw new MediaFileMimeTypeError(mimeType, this.validMimeTypes);

        return {
            name: this.generateRandomName(rawName),
        };
    }

    private validateSize(size: number) {
        return size <= this.maxSize;
    }

    private validateMimeType(mimeType: string) {
        return this.validMimeTypes.includes(mimeType);
    }

    private generateRandomName(rawName: string) {
        const extension = rawName.split('.').pop();
        return `${this.generateHash(rawName)}.${extension}`;
    }

    private generateHash(str: string = '') {
        return crypto
            .createHash('sha256')
            .update(str + Math.random() + Date.now())
            .digest('hex');
    }
}
