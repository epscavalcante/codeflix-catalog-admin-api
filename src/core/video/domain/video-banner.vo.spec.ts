import MediaFileSizeError from '@core/shared/domain/errors/media-file-size.error';
import VideoBanner from './video-banner.vo';
import { VideoId } from './video.aggragate';
import MediaFileMimeTypeError from '@core/shared/domain/errors/media-file-mime-type.error';

describe('Vídeo Banner Unit Tests', () => {
    it('Deve criar um banner com um arquivo válido', () => {
        const data = Buffer.alloc(1024);
        const videoId = new VideoId();
        const [banner, error] = VideoBanner.createFromFile(
            'test.png',
            'image/png',
            data.length,
            videoId,
        ).asArray();

        expect(error).toBeNull();
        expect(banner).toBeInstanceOf(VideoBanner);
        expect(banner.name).toMatch(/\.png$/);
        expect(banner.location).toBe(`videos/${videoId.value}/images`);
    });

    it('Lança erro quando arquivo tem tamanho muito grande', () => {
        const data = Buffer.alloc(VideoBanner.MAX_SIZE + 1);
        const videoId = new VideoId();
        const [banner, error] = VideoBanner.createFromFile(
            'test.png',
            'image/png',
            data.length,
            videoId,
        );

        expect(banner).toBeNull();
        expect(error).toBeInstanceOf(MediaFileSizeError);
    });

    it('Lança erro quando o mime type for inválido', () => {
        const data = Buffer.alloc(1024);
        const videoId = new VideoId();
        const [banner, error] = VideoBanner.createFromFile(
            'test.txt',
            'text/plain',
            data.length,
            videoId,
        );

        expect(banner).toBeNull();
        expect(error).toBeInstanceOf(MediaFileMimeTypeError);
    });
});
