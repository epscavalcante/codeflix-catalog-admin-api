import MediaFileMimeTypeError from '../errors/media-file-mime-type.error';
import MediaFileSizeError from '../errors/media-file-size.error';
import MediaFileValidator from './media-file.validator';

describe('MediaFileValidator Unit Tests', () => {
    const validator = new MediaFileValidator(1024 * 1024, [
        'image/png',
        'image/jpeg',
    ]);

    it('should throw an error if the file size is too large', () => {
        const data = Buffer.alloc(1024 * 1024 + 1);
        expect(() =>
            validator.validate('test.png', 'image/png', data.length),
        ).toThrow(new MediaFileSizeError(data.length, validator['maxSize']));
    });

    it('should throw an error if the file mime type is not valid', () => {
        const data = Buffer.alloc(1024);
        expect(() =>
            validator.validate('test.txt', 'text/plain', data.length),
        ).toThrow(
            new MediaFileMimeTypeError(
                'text/plain',
                validator['validMimeTypes'],
            ),
        );
    });

    it('should return a valid file name', () => {
        const data = Buffer.alloc(1024);
        const { name } = validator.validate(
            'test.png',
            'image/png',
            data.length,
        );

        expect(name).toMatch(/\.png$/);
        expect(name).toHaveLength(68); // tamanho do sha256 + tamanho da extensão
    });
});
