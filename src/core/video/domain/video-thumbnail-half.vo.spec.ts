import MediaFileSizeError from '@core/shared/domain/errors/media-file-size.error';
import VideoThumbnailHalf from './video-thumbnail.vo';
import { VideoId } from './video.aggregate';
import MediaFileMimeTypeError from '@core/shared/domain/errors/media-file-mime-type.error';

describe('Video ThumbnailHalf Unit Tests', () => {
    it('Deve criar um thumbnail half com um arquivo válido', () => {
        const data = Buffer.alloc(1024);
        const videoId = new VideoId();
        const [thumbnail, error] = VideoThumbnailHalf.createFromFile(
            'test.png',
            'image/png',
            data.length,
            videoId,
        ).asArray();

        expect(error).toBeNull();
        expect(thumbnail).toBeInstanceOf(VideoThumbnailHalf);
        expect(thumbnail.name).toMatch(/\.png$/);
        expect(thumbnail.location).toBe(`videos/${videoId.value}/images`);
    });

    it('Lança erro quando arquivo tem tamanho muito grande', () => {
        const data = Buffer.alloc(VideoThumbnailHalf.MAX_SIZE + 1);
        const videoId = new VideoId();
        const [thumbnail, error] = VideoThumbnailHalf.createFromFile(
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
        const [thumbnail, error] = VideoThumbnailHalf.createFromFile(
            'test.txt',
            'text/plain',
            data.length,
            videoId,
        );

        expect(thumbnail).toBeNull();
        expect(error).toBeInstanceOf(MediaFileMimeTypeError);
    });
});
