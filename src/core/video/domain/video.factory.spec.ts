import { Chance } from 'chance';
import VideoFactory from './video.factory';
import { VideoId } from './video.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import Rating from './video-rating.vo';
import GenreId from '@core/genre/domain/genre.id.vo';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import VideoMedia from './video-media.vo';
import VideoTrailer from './video-trailer.vo';
import VideoThumbnailHalf from './video-thumbnail-half.vo';
import VideoThumbnail from './video-thumbnail.vo';
import VideoBanner from './video-banner.vo';

describe('VideoFakerBuilder Unit Tests', () => {
    describe('videoId prop', () => {
        const faker = VideoFactory.aVideoWithoutMedias();

        test('should throw error when any with methods has called', () => {
            expect(() => faker.videoId).toThrowError(
                new Error(
                    "Property videoId not have a factory, use 'with' methods",
                ),
            );
        });

        test('should be undefined', () => {
            expect(faker['_videoId']).toBeUndefined();
        });

        test('withVideoId', () => {
            const videoId = new VideoId();
            const $this = faker.withVideoId(videoId);
            expect($this).toBeInstanceOf(VideoFactory);
            expect(faker['_videoId']).toBe(videoId);

            faker.withVideoId(() => videoId);
            // @ts-expect-error _videoId is a callable
            expect(faker['_videoId']()).toBe(videoId);

            expect(faker.videoId).toBe(videoId);
        });

        test('should pass index to videoId factory', () => {
            let mockFactory = jest.fn(() => new VideoId());
            faker.withVideoId(mockFactory);
            faker.build();
            expect(mockFactory).toHaveBeenCalledTimes(1);

            const genreId = new VideoId();
            mockFactory = jest.fn(() => genreId);
            const fakerMany = VideoFactory.theVideosWithoutMedias(2);
            fakerMany.withVideoId(mockFactory);
            fakerMany.build();

            expect(mockFactory).toHaveBeenCalledTimes(2);
            expect(fakerMany.build()[0].videoId).toBe(genreId);
            expect(fakerMany.build()[1].videoId).toBe(genreId);
        });
    });

    describe('title prop', () => {
        const faker = VideoFactory.aVideoWithoutMedias();
        test('should be a function', () => {
            expect(typeof faker['_title']).toBe('function');
        });

        test('should call the word method', () => {
            const chance = Chance();
            const spyWordMethod = jest.spyOn(chance, 'word');
            faker['chance'] = chance;
            faker.build();

            expect(spyWordMethod).toHaveBeenCalled();
        });

        test('withTitle', () => {
            const $this = faker.withTitle('test title');
            expect($this).toBeInstanceOf(VideoFactory);
            expect(faker['_title']).toBe('test title');

            faker.withTitle(() => 'test title');
            //@ts-expect-error title is callable
            expect(faker['_title']()).toBe('test title');

            expect(faker.title).toBe('test title');
        });

        test('should pass index to title factory', () => {
            faker.withTitle((index) => `test title ${index}`);
            const video = faker.build();
            expect(video.title).toBe(`test title 0`);

            const fakerMany = VideoFactory.theVideosWithoutMedias(2);
            fakerMany.withTitle((index) => `test title ${index}`);
            const categories = fakerMany.build();

            expect(categories[0].title).toBe(`test title 0`);
            expect(categories[1].title).toBe(`test title 1`);
        });

        test('invalid too long case', () => {
            const $this = faker.withInvalidTitleTooLong();
            expect($this).toBeInstanceOf(VideoFactory);
            expect(faker['_title'].length).toBe(256);

            const tooLong = 'a'.repeat(256);
            faker.withInvalidTitleTooLong(tooLong);
            expect(faker['_title'].length).toBe(256);
            expect(faker['_title']).toBe(tooLong);
        });
    });

    describe('categoriesId prop', () => {
        const faker = VideoFactory.aVideoWithoutMedias();
        it('should be empty', () => {
            expect(faker['_categoriesId']).toBeInstanceOf(Array);
        });

        test('withCategoryId', () => {
            const categoryId1 = new CategoryId();
            const $this = faker.addCategoryId(categoryId1);
            expect($this).toBeInstanceOf(VideoFactory);
            expect(faker['_categoriesId']).toStrictEqual([categoryId1]);

            const categoryId2 = new CategoryId();
            faker.addCategoryId(() => categoryId2);

            expect([
                faker['_categoriesId'][0],
                //@ts-expect-error _categoriesId is callable
                faker['_categoriesId'][1](),
            ]).toStrictEqual([categoryId1, categoryId2]);
        });

        it('should pass index to categoriesId factory', () => {
            const categoriesId = [new CategoryId(), new CategoryId()];
            faker.addCategoryId((index) => categoriesId[index]);
            const genre = faker.build();

            expect(genre.categoriesId.get(categoriesId[0].value)).toBe(
                categoriesId[0],
            );

            const fakerMany = VideoFactory.theVideosWithoutMedias(2);
            fakerMany.addCategoryId((index) => categoriesId[index]);
            const genres = fakerMany.build();

            expect(genres[0].categoriesId.get(categoriesId[0].value)).toBe(
                categoriesId[0],
            );

            expect(genres[1].categoriesId.get(categoriesId[1].value)).toBe(
                categoriesId[1],
            );
        });
    });

    describe('createdAt prop', () => {
        const faker = VideoFactory.aVideoWithoutMedias();

        test('should throw error when any with methods has called', () => {
            const fakerVideo = VideoFactory.aVideoWithoutMedias();
            expect(() => fakerVideo.createdAt).toThrowError(
                new Error(
                    "Property createdAt not have a factory, use 'with' methods",
                ),
            );
        });

        test('should be undefined', () => {
            expect(faker['_createdAt']).toBeUndefined();
        });

        test('withCreatedAt', () => {
            const date = new Date();
            const $this = faker.withCreatedAt(date);
            expect($this).toBeInstanceOf(VideoFactory);
            expect(faker['_createdAt']).toBe(date);

            faker.withCreatedAt(() => date);
            //@ts-expect-error _createdAt is a callable
            expect(faker['_createdAt']()).toBe(date);
            expect(faker.createdAt).toBe(date);
        });
        test.skip('should pass index to createdAt factory', () => {
            const date = new Date();
            faker.withCreatedAt(
                (index) => new Date(date.getTime() + index + 2),
            );
            const video = faker.build();
            expect(video.createdAt.getTime()).toBe(date.getTime() + 2);

            const fakerMany = VideoFactory.theVideosWithoutMedias(2);
            fakerMany.withCreatedAt(
                (index) => new Date(date.getTime() + index + 2),
            );
            const categories = fakerMany.build();

            expect(categories[0].createdAt.getTime()).toBe(date.getTime() + 2);
            expect(categories[1].createdAt.getTime()).toBe(date.getTime() + 3);
        });
    });

    it('should create a video without medias', () => {
        let video = VideoFactory.aVideoWithoutMedias().build();

        expect(video.videoId).toBeInstanceOf(VideoId);
        expect(typeof video.title === 'string').toBeTruthy();
        expect(typeof video.description === 'string').toBeTruthy();
        expect(typeof video.yearLaunched === 'number').toBeTruthy();
        expect(typeof video.duration === 'number').toBeTruthy();
        expect(video.rating).toEqual(Rating.createRL());
        expect(video.isOpened).toBeTruthy();
        expect(video.isPublished).toBeFalsy();
        expect(video.banner).toBeNull();
        expect(video.thumbnail).toBeNull();
        expect(video.thumbnailHalf).toBeNull();
        expect(video.trailer).toBeNull();
        expect(video.video).toBeNull();
        expect(video.categoriesId).toBeInstanceOf(Map);
        expect(video.categoriesId.size).toBe(1);
        expect(video.categoriesId.values().next().value).toBeInstanceOf(
            CategoryId,
        );
        expect(video.genresId).toBeInstanceOf(Map);
        expect(video.genresId.size).toBe(1);
        expect(video.genresId.values().next().value).toBeInstanceOf(GenreId);
        expect(video.castMembersId).toBeInstanceOf(Map);
        expect(video.castMembersId.size).toBe(1);
        expect(video.castMembersId.values().next().value).toBeInstanceOf(
            CastMemberId,
        );
        expect(video.createdAt).toBeInstanceOf(Date);

        const createdAt = new Date();
        const videoId = new VideoId();
        const categoryId1 = new CategoryId();
        const categoryId2 = new CategoryId();
        const genreId1 = new GenreId();
        const genreId2 = new GenreId();
        const castMemberId1 = new CastMemberId();
        const castMemberId2 = new CastMemberId();
        video = VideoFactory.aVideoWithoutMedias()
            .withVideoId(videoId)
            .withTitle('name test')
            .withDescription('description test')
            .withYearLaunched(2020)
            .withDuration(90)
            .withRating(Rating.createR10())
            .withMarkAsNotOpened()
            .addCategoryId(categoryId1)
            .addCategoryId(categoryId2)
            .addGenreId(genreId1)
            .addGenreId(genreId2)
            .addCastMemberId(castMemberId1)
            .addCastMemberId(castMemberId2)
            .withCreatedAt(createdAt)
            .build();
        expect(video.videoId.value).toBe(videoId.value);
        expect(video.title).toBe('name test');
        expect(video.description).toBe('description test');
        expect(video.yearLaunched).toBe(2020);
        expect(video.duration).toBe(90);
        expect(video.rating).toEqual(Rating.createR10());
        expect(video.isOpened).toBeFalsy();
        expect(video.isPublished).toBeFalsy();
        expect(video.banner).toBeNull();
        expect(video.thumbnail).toBeNull();
        expect(video.thumbnailHalf).toBeNull();
        expect(video.trailer).toBeNull();
        expect(video.video).toBeNull();
        expect(video.categoriesId).toBeInstanceOf(Map);
        expect(video.categoriesId.get(categoryId1.value)).toBe(categoryId1);
        expect(video.categoriesId.get(categoryId2.value)).toBe(categoryId2);
        expect(video.genresId).toBeInstanceOf(Map);
        expect(video.genresId.get(genreId1.value)).toBe(genreId1);
        expect(video.genresId.get(genreId2.value)).toBe(genreId2);
        expect(video.castMembersId).toBeInstanceOf(Map);
        expect(video.castMembersId.get(castMemberId1.value)).toBe(
            castMemberId1,
        );
        expect(video.castMembersId.get(castMemberId2.value)).toBe(
            castMemberId2,
        );
        // expect(video.createdAt).toEqual(createdAt);
    });

    it('should create a video with medias', () => {
        let video = VideoFactory.aVideoWithAllMedias().build();

        expect(video.videoId).toBeInstanceOf(VideoId);
        expect(typeof video.title === 'string').toBeTruthy();
        expect(typeof video.description === 'string').toBeTruthy();
        expect(typeof video.yearLaunched === 'number').toBeTruthy();
        expect(typeof video.duration === 'number').toBeTruthy();
        expect(video.rating).toEqual(Rating.createRL());
        expect(video.isOpened).toBeTruthy();
        expect(video.isPublished).toBeFalsy();
        expect(video.banner).toBeInstanceOf(VideoBanner);
        expect(video.thumbnail).toBeInstanceOf(VideoThumbnail);
        expect(video.thumbnailHalf).toBeInstanceOf(VideoThumbnailHalf);
        expect(video.trailer).toBeInstanceOf(VideoTrailer);
        expect(video.video).toBeInstanceOf(VideoMedia);
        expect(video.categoriesId).toBeInstanceOf(Map);
        expect(video.categoriesId.size).toBe(1);
        expect(video.categoriesId.values().next().value).toBeInstanceOf(
            CategoryId,
        );
        expect(video.genresId).toBeInstanceOf(Map);
        expect(video.genresId.size).toBe(1);
        expect(video.genresId.values().next().value).toBeInstanceOf(GenreId);
        expect(video.castMembersId).toBeInstanceOf(Map);
        expect(video.castMembersId.size).toBe(1);
        expect(video.castMembersId.values().next().value).toBeInstanceOf(
            CastMemberId,
        );
        expect(video.createdAt).toBeInstanceOf(Date);

        const createdAt = new Date();
        const videoId = new VideoId();
        const categoryId1 = new CategoryId();
        const categoryId2 = new CategoryId();
        const genreId1 = new GenreId();
        const genreId2 = new GenreId();
        const castMemberId1 = new CastMemberId();
        const castMemberId2 = new CastMemberId();
        const banner = new VideoBanner({
            location: 'location',
            name: 'name',
        });
        const thumbnail = new VideoThumbnail({
            location: 'location',
            name: 'name',
        });
        const thumbnailHalf = new VideoThumbnailHalf({
            location: 'location',
            name: 'name',
        });
        const trailer = VideoTrailer.create('raw_location', 'name');
        const videoMedia = VideoMedia.create('raw_location', 'name');
        video = VideoFactory.aVideoWithAllMedias()
            .withVideoId(videoId)
            .withTitle('name test')
            .withDescription('description test')
            .withYearLaunched(2020)
            .withDuration(90)
            .withRating(Rating.createR10())
            .withMarkAsNotOpened()
            .addCategoryId(categoryId1)
            .addCategoryId(categoryId2)
            .addGenreId(genreId1)
            .addGenreId(genreId2)
            .addCastMemberId(castMemberId1)
            .addCastMemberId(castMemberId2)
            .withVideoBanner(banner)
            .withVideoThumbnail(thumbnail)
            .withVideoThumbnailHalf(thumbnailHalf)
            .withVideoTrailer(trailer)
            .withVideo(videoMedia)
            .withCreatedAt(createdAt)
            .build();
        expect(video.videoId.value).toBe(videoId.value);
        expect(video.title).toBe('name test');
        expect(video.description).toBe('description test');
        expect(video.yearLaunched).toBe(2020);
        expect(video.duration).toBe(90);
        expect(video.rating).toEqual(Rating.createR10());
        expect(video.isOpened).toBeFalsy();
        expect(video.isPublished).toBeFalsy();
        expect(video.banner).toBe(banner);
        expect(video.thumbnail).toBe(thumbnail);
        expect(video.thumbnailHalf).toBe(thumbnailHalf);
        expect(video.trailer).toBe(trailer);
        expect(video.video).toBe(videoMedia);
        expect(video.categoriesId).toBeInstanceOf(Map);
        expect(video.categoriesId.get(categoryId1.value)).toBe(categoryId1);
        expect(video.categoriesId.get(categoryId2.value)).toBe(categoryId2);
        expect(video.genresId).toBeInstanceOf(Map);
        expect(video.genresId.get(genreId1.value)).toBe(genreId1);
        expect(video.genresId.get(genreId2.value)).toBe(genreId2);
        expect(video.castMembersId).toBeInstanceOf(Map);
        expect(video.castMembersId.get(castMemberId1.value)).toBe(
            castMemberId1,
        );
        expect(video.castMembersId.get(castMemberId2.value)).toBe(
            castMemberId2,
        );
        expect(video.createdAt).toEqual(createdAt);
    });

    it('should create many videos without medias', () => {
        const faker = VideoFactory.theVideosWithoutMedias(2);
        let videos = faker.build();
        videos.forEach((video) => {
            expect(video.videoId).toBeInstanceOf(VideoId);
            expect(typeof video.title === 'string').toBeTruthy();
            expect(typeof video.description === 'string').toBeTruthy();
            expect(typeof video.yearLaunched === 'number').toBeTruthy();
            expect(typeof video.duration === 'number').toBeTruthy();
            expect(video.rating).toEqual(Rating.createRL());
            expect(video.isOpened).toBeTruthy();
            expect(video.isPublished).toBeFalsy();
            expect(video.banner).toBeNull();
            expect(video.thumbnail).toBeNull();
            expect(video.thumbnailHalf).toBeNull();
            expect(video.trailer).toBeNull();
            expect(video.video).toBeNull();
            expect(video.categoriesId).toBeInstanceOf(Map);
            expect(video.categoriesId.size).toBe(1);
            expect(video.categoriesId.values().next().value).toBeInstanceOf(
                CategoryId,
            );
            expect(video.genresId).toBeInstanceOf(Map);
            expect(video.genresId.size).toBe(1);
            expect(video.genresId.values().next().value).toBeInstanceOf(
                GenreId,
            );
            expect(video.castMembersId).toBeInstanceOf(Map);
            expect(video.castMembersId.size).toBe(1);
            expect(video.castMembersId.values().next().value).toBeInstanceOf(
                CastMemberId,
            );
            expect(video.createdAt).toBeInstanceOf(Date);
        });

        const createdAt = new Date();
        const videoId = new VideoId();
        const categoryId1 = new CategoryId();
        const categoryId2 = new CategoryId();
        const genreId1 = new GenreId();
        const genreId2 = new GenreId();
        const castMemberId1 = new CastMemberId();
        const castMemberId2 = new CastMemberId();
        videos = VideoFactory.theVideosWithoutMedias(2)
            .withVideoId(videoId)
            .withTitle('name test')
            .withDescription('description test')
            .withYearLaunched(2020)
            .withDuration(90)
            .withRating(Rating.createR10())
            .withMarkAsNotOpened()
            .addCategoryId(categoryId1)
            .addCategoryId(categoryId2)
            .addGenreId(genreId1)
            .addGenreId(genreId2)
            .addCastMemberId(castMemberId1)
            .addCastMemberId(castMemberId2)
            .withCreatedAt(createdAt)
            .build();
        videos.forEach((video) => {
            expect(video.videoId.value).toBe(videoId.value);
            expect(video.title).toBe('name test');
            expect(video.description).toBe('description test');
            expect(video.yearLaunched).toBe(2020);
            expect(video.duration).toBe(90);
            expect(video.rating).toEqual(Rating.createR10());
            expect(video.isOpened).toBeFalsy();
            expect(video.isPublished).toBeFalsy();
            expect(video.banner).toBeNull();
            expect(video.thumbnail).toBeNull();
            expect(video.thumbnailHalf).toBeNull();
            expect(video.trailer).toBeNull();
            expect(video.video).toBeNull();
            expect(video.categoriesId).toBeInstanceOf(Map);
            expect(video.categoriesId.get(categoryId1.value)).toBe(categoryId1);
            expect(video.categoriesId.get(categoryId2.value)).toBe(categoryId2);
            expect(video.genresId).toBeInstanceOf(Map);
            expect(video.genresId.get(genreId1.value)).toBe(genreId1);
            expect(video.genresId.get(genreId2.value)).toBe(genreId2);
            expect(video.castMembersId).toBeInstanceOf(Map);
            expect(video.castMembersId.get(castMemberId1.value)).toBe(
                castMemberId1,
            );
            expect(video.castMembersId.get(castMemberId2.value)).toBe(
                castMemberId2,
            );
            expect(video.createdAt).toEqual(createdAt);
        });
    });

    it('should create many videos with medias', () => {
        const faker = VideoFactory.theVideosWithAllMedias(2);
        let videos = faker.build();
        videos.forEach((video) => {
            expect(video.videoId).toBeInstanceOf(VideoId);
            expect(typeof video.title === 'string').toBeTruthy();
            expect(typeof video.description === 'string').toBeTruthy();
            expect(typeof video.yearLaunched === 'number').toBeTruthy();
            expect(typeof video.duration === 'number').toBeTruthy();
            expect(video.rating).toEqual(Rating.createRL());
            expect(video.isOpened).toBeTruthy();
            expect(video.isPublished).toBeFalsy();
            expect(video.banner).toBeInstanceOf(VideoBanner);
            expect(video.thumbnail).toBeInstanceOf(VideoThumbnail);
            expect(video.thumbnailHalf).toBeInstanceOf(VideoThumbnailHalf);
            expect(video.trailer).toBeInstanceOf(VideoTrailer);
            expect(video.video).toBeInstanceOf(VideoMedia);
            expect(video.categoriesId).toBeInstanceOf(Map);
            expect(video.categoriesId.size).toBe(1);
            expect(video.categoriesId.values().next().value).toBeInstanceOf(
                CategoryId,
            );
            expect(video.genresId).toBeInstanceOf(Map);
            expect(video.genresId.size).toBe(1);
            expect(video.genresId.values().next().value).toBeInstanceOf(
                GenreId,
            );
            expect(video.castMembersId).toBeInstanceOf(Map);
            expect(video.castMembersId.size).toBe(1);
            expect(video.castMembersId.values().next().value).toBeInstanceOf(
                CastMemberId,
            );
            expect(video.createdAt).toBeInstanceOf(Date);
        });

        const createdAt = new Date();
        const videoId = new VideoId();
        const categoryId1 = new CategoryId();
        const categoryId2 = new CategoryId();
        const genreId1 = new GenreId();
        const genreId2 = new GenreId();
        const castMemberId1 = new CastMemberId();
        const castMemberId2 = new CastMemberId();
        const banner = new VideoBanner({
            location: 'location',
            name: 'name',
        });
        const thumbnail = new VideoThumbnail({
            location: 'location',
            name: 'name',
        });
        const thumbnailHalf = new VideoThumbnailHalf({
            location: 'location',
            name: 'name',
        });
        const trailer = VideoTrailer.create('raw_location', 'name');
        const videoMedia = VideoMedia.create('raw_location', 'name');
        videos = VideoFactory.theVideosWithAllMedias(2)
            .withVideoId(videoId)
            .withTitle('name test')
            .withDescription('description test')
            .withYearLaunched(2020)
            .withDuration(90)
            .withRating(Rating.createR10())
            .withMarkAsNotOpened()
            .addCategoryId(categoryId1)
            .addCategoryId(categoryId2)
            .addGenreId(genreId1)
            .addGenreId(genreId2)
            .addCastMemberId(castMemberId1)
            .addCastMemberId(castMemberId2)
            .withVideoBanner(banner)
            .withVideoThumbnail(thumbnail)
            .withVideoThumbnailHalf(thumbnailHalf)
            .withVideoTrailer(trailer)
            .withVideo(videoMedia)
            .withCreatedAt(createdAt)
            .build();
        videos.forEach((video) => {
            expect(video.videoId.value).toBe(videoId.value);
            expect(video.title).toBe('name test');
            expect(video.description).toBe('description test');
            expect(video.yearLaunched).toBe(2020);
            expect(video.duration).toBe(90);
            expect(video.rating).toEqual(Rating.createR10());
            expect(video.isOpened).toBeFalsy();
            expect(video.isPublished).toBeFalsy();
            expect(video.banner).toBe(banner);
            expect(video.thumbnail).toBe(thumbnail);
            expect(video.thumbnailHalf).toBe(thumbnailHalf);
            expect(video.trailer).toBe(trailer);
            expect(video.video).toBe(videoMedia);
            expect(video.categoriesId).toBeInstanceOf(Map);
            expect(video.categoriesId.get(categoryId1.value)).toBe(categoryId1);
            expect(video.categoriesId.get(categoryId2.value)).toBe(categoryId2);
            expect(video.genresId).toBeInstanceOf(Map);
            expect(video.genresId.get(genreId1.value)).toBe(genreId1);
            expect(video.genresId.get(genreId2.value)).toBe(genreId2);
            expect(video.castMembersId).toBeInstanceOf(Map);
            expect(video.castMembersId.get(castMemberId1.value)).toBe(
                castMemberId1,
            );
            expect(video.castMembersId.get(castMemberId2.value)).toBe(
                castMemberId2,
            );
            expect(video.createdAt).toEqual(createdAt);
        });
    });
});
