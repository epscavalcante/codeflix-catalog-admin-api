import MediaFileSizeError from '@core/shared/domain/errors/media-file-size.error';
import VideoThumbnail from './video-thumbnail.vo';
import { VideoId } from './video.aggragate';
import MediaFileMimeTypeError from '@core/shared/domain/errors/media-file-mime-type.error';

describe('Video Thumbnail Unit Tests', () => {
    it('Deve criar um thumbnail com um arquivo válido', () => {
        const data = Buffer.alloc(1024);
        const videoId = new VideoId();
        const [thumbnail, error] = VideoThumbnail.createFromFile(
            'test.png',
            'image/png',
            data.length,
            videoId,
        ).asArray();

        expect(error).toBeNull();
        expect(thumbnail).toBeInstanceOf(VideoThumbnail);
        expect(thumbnail.name).toMatch(/\.png$/);
        expect(thumbnail.location).toBe(`videos/${videoId.value}/images`);
    });

    it('Lança erro quando arquivo tem tamanho muito grande', () => {
        const data = Buffer.alloc(VideoThumbnail.MAX_SIZE + 1);
        const videoId = new VideoId();
        const [thumbnail, error] = VideoThumbnail.createFromFile(
            'test.png',
            'image/png',
            data.length,
            videoId,
        );

        expect(thumbnail).toBeNull();
        expect(error).toBeInstanceOf(MediaFileSizeError);
    });

    it('Lança erro quando o mime type for inválido', () => {
        const data = Buffer.alloc(1024);
        const videoId = new VideoId();
        const [thumbnail, error] = VideoThumbnail.createFromFile(
            'test.txt',
            'text/plain',
            data.length,
            videoId,
        );

        expect(thumbnail).toBeNull();
        expect(error).toBeInstanceOf(MediaFileMimeTypeError);
    });
});
