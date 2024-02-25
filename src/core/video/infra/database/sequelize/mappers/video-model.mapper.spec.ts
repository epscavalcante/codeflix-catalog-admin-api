import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import CastMemberSequelizeRepository from '@core/cast-member/infra/repositories/cast-member-sequelize.repository';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import { GenreModel } from '@core/genre/infra/database/sequelize/models/genre.model';
import GenreSequelizeRepository from '@core/genre/infra/repositories/genre-sequelize.repository';
import Rating, {
    RatingClassifications,
} from '@core/video/domain/video-rating.vo';
import { setupDatabaseForVideo } from '../../setup-database';
import VideoModel, {
    VideoCastMemberModel,
    VideoCategoryModel,
    VideoGenreModel,
} from '../models/video.model';
import VideoModelMapper from './video-model.mapper';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import MemoryUnitOfWorkRepository from '@core/shared/infra/repositories/memory-unit-of-work.repository';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import Video, { VideoId } from '@core/video/domain/video.aggregate';
import VideoImageMediaModel, {
    ImageMediaRelatedField,
} from '../models/video-image-media.model';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import AudioVideoMediaModel, {
    AudioVideoMediaRelatedField,
} from '../models/video-audio-media.model';
import VideoMedia from '@core/video/domain/video-media.vo';
import VideoBanner from '@core/video/domain/video-banner.vo';
import VideoThumbnail from '@core/video/domain/video-thumbnail.vo';
import VideoThumbnailHalf from '@core/video/domain/video-thumbnail-half.vo';
import VideoTrailer from '@core/video/domain/video-trailer.vo';
setupDatabaseForVideo();

describe('VideoModelMapper Unit Tests', () => {
    let categoryRepo: ICategoryRepository;
    let genreRepo: IGenreRepository;
    let castMemberRepo: ICastMemberRepository;

    beforeEach(() => {
        categoryRepo = new CategorySequelizeRepository(CategoryModel);
        castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
        genreRepo = new GenreSequelizeRepository(
            GenreModel,
            new MemoryUnitOfWorkRepository() as any,
        );
    });

    test('Validação de errors', () => {
        const arrange = [
            {
                makeModel: () => {
                    return VideoModel.build({
                        videoId: '9366b7dc-2d71-4799-b91c-c64adb205104',
                        title: 't'.repeat(256),
                        categoriesId: [],
                        genresId: [],
                        castMembersId: [],
                    } as any);
                },
                expectedErrors: [
                    {
                        categoriesId: ['categoriesId should not be empty'],
                    },
                    {
                        genresId: ['genresId should not be empty'],
                    },
                    {
                        castMembersId: ['castMembersId should not be empty'],
                    },
                    {
                        rating: [
                            `The rating must be one of the following options: ${Object.values(
                                RatingClassifications,
                            ).join(', ')}. Passed value: undefined`,
                        ],
                    },
                    {
                        title: [
                            'title must be shorter than or equal to 255 characters',
                        ],
                    },
                ],
            },
        ];

        for (const item of arrange) {
            try {
                VideoModelMapper.toEntity(item.makeModel());
                fail(
                    'The genre is valid, but it needs throws a EntityValidationError',
                );
            } catch (e) {
                expect(e).toBeInstanceOf(EntityValidationError);
                expect(e.error).toMatchObject(item.expectedErrors);
            }
        }
    });

    test('Deve mapear de Model para Entity', async () => {
        const category1 = Category.fake().aCategory().build();
        await categoryRepo.bulkInsert([category1]);
        const genre1 = Genre.fake()
            .aGenre()
            .addCategoryId(category1.categoryId)
            .build();
        await genreRepo.bulkInsert([genre1]);
        const castMember1 = CastMember.fake().anActor().build();
        await castMemberRepo.bulkInsert([castMember1]);

        const videoProps = {
            videoId: new VideoId().value,
            title: 'title',
            description: 'description',
            yearLaunched: 2020,
            duration: 90,
            rating: RatingClassifications.R10,
            isOpened: false,
            isPublished: false,
            createdAt: new Date(),
        };

        let model = await VideoModel.create(
            {
                ...videoProps,
                categoriesId: [
                    VideoCategoryModel.build({
                        videoId: videoProps.videoId,
                        categoryId: category1.categoryId.value,
                    }),
                ],
                genresId: [
                    VideoGenreModel.build({
                        videoId: videoProps.videoId,
                        genreId: genre1.genreId.value,
                    }),
                ],
                castMembersId: [
                    VideoCastMemberModel.build({
                        videoId: videoProps.videoId,
                        castMemberId: castMember1.castMemberId.value,
                    }),
                ],
            } as any,
            { include: ['categoriesId', 'genresId', 'castMembersId'] },
        );
        let entity = VideoModelMapper.toEntity(model);
        expect(entity.toJSON()).toEqual(
            new Video({
                videoId: new VideoId(model.videoId),
                title: videoProps.title,
                description: videoProps.description,
                yearLaunched: videoProps.yearLaunched,
                duration: videoProps.duration,
                rating: Rating.createR10(),
                isOpened: videoProps.isOpened,
                isPublished: videoProps.isPublished,
                createdAt: videoProps.createdAt,
                categoriesId: new Map([
                    [category1.categoryId.value, category1.categoryId],
                ]),
                genresId: new Map([[genre1.genreId.value, genre1.genreId]]),
                castMembersId: new Map([
                    [castMember1.castMemberId.value, castMember1.castMemberId],
                ]),
            }).toJSON(),
        );

        videoProps.videoId = new VideoId().value;
        model = await VideoModel.create(
            {
                ...videoProps,
                imageMedias: [
                    VideoImageMediaModel.build({
                        videoId: videoProps.videoId,
                        location: 'location banner',
                        name: 'name banner',
                        videoRelatedField: ImageMediaRelatedField.BANNER,
                    } as any),
                    VideoImageMediaModel.build({
                        videoId: videoProps.videoId,
                        location: 'location thumbnail',
                        name: 'name thumbnail',
                        videoRelatedField: ImageMediaRelatedField.THUMBNAIL,
                    } as any),
                    VideoImageMediaModel.build({
                        videoId: videoProps.videoId,
                        location: 'location thumbnail half',
                        name: 'name thumbnail half',
                        videoRelatedField:
                            ImageMediaRelatedField.THUMBNAIL_HALF,
                    } as any),
                ],
                audioVideoMedias: [
                    AudioVideoMediaModel.build({
                        videoId: videoProps.videoId,
                        name: 'name trailer',
                        rawLocation: 'rawLocation trailer',
                        encodedLocation: 'encodedLocation trailer',
                        status: AudioVideoMediaStatus.COMPLETED,
                        videoRelatedField: AudioVideoMediaRelatedField.TRAILER,
                    } as any),
                    AudioVideoMediaModel.build({
                        videoId: videoProps.videoId,
                        name: 'name video',
                        rawLocation: 'rawLocation video',
                        encodedLocation: 'encodedLocation video',
                        status: AudioVideoMediaStatus.COMPLETED,
                        videoRelatedField: AudioVideoMediaRelatedField.VIDEO,
                    } as any),
                ],
                categoriesId: [
                    VideoCategoryModel.build({
                        videoId: videoProps.videoId,
                        categoryId: category1.categoryId.value,
                    }),
                ],
                genresId: [
                    VideoGenreModel.build({
                        videoId: videoProps.videoId,
                        genreId: genre1.genreId.value,
                    }),
                ],
                castMembersId: [
                    VideoCastMemberModel.build({
                        videoId: videoProps.videoId,
                        castMemberId: castMember1.castMemberId.value,
                    }),
                ],
            },
            {
                include: [
                    'categoriesId',
                    'genresId',
                    'castMembersId',
                    'imageMedias',
                    'audioVideoMedias',
                ],
            },
        );

        entity = VideoModelMapper.toEntity(model);
        expect(entity.toJSON()).toEqual(
            new Video({
                videoId: new VideoId(model.videoId),
                title: videoProps.title,
                description: videoProps.description,
                yearLaunched: videoProps.yearLaunched,
                duration: videoProps.duration,
                rating: Rating.createR10(),
                isOpened: videoProps.isOpened,
                isPublished: videoProps.isPublished,
                createdAt: videoProps.createdAt,
                banner: new VideoBanner({
                    location: 'location banner',
                    name: 'name banner',
                }),
                thumbnail: new VideoThumbnail({
                    location: 'location thumbnail',
                    name: 'name thumbnail',
                }),
                thumbnailHalf: new VideoThumbnailHalf({
                    location: 'location thumbnail half',
                    name: 'name thumbnail half',
                }),
                trailer: new VideoTrailer({
                    name: 'name trailer',
                    rawLocation: 'rawLocation trailer',
                    encodedLocation: 'encodedLocation trailer',
                    status: AudioVideoMediaStatus.COMPLETED,
                }),
                video: new VideoMedia({
                    name: 'name video',
                    rawLocation: 'rawLocation video',
                    encodedLocation: 'encodedLocation video',
                    status: AudioVideoMediaStatus.COMPLETED,
                }),
                categoriesId: new Map([
                    [category1.categoryId.value, category1.categoryId],
                ]),
                genresId: new Map([[genre1.genreId.value, genre1.genreId]]),
                castMembersId: new Map([
                    [castMember1.castMemberId.value, castMember1.castMemberId],
                ]),
            }).toJSON(),
        );
    });

    test('Deve mapear de Entity para Model props', async () => {
        const category1 = Category.fake().aCategory().build();
        await categoryRepo.bulkInsert([category1]);
        const genre1 = Genre.fake()
            .aGenre()
            .addCategoryId(category1.categoryId)
            .build();
        await genreRepo.bulkInsert([genre1]);
        const castMember1 = CastMember.fake().anActor().build();
        await castMemberRepo.bulkInsert([castMember1]);

        const videoProps = {
            videoId: new VideoId(),
            title: 'title',
            description: 'description',
            yearLaunched: 2020,
            duration: 90,
            rating: Rating.createR10(),
            isOpened: false,
            isPublished: false,
            createdAt: new Date(),
        };

        let entity = new Video({
            ...videoProps,
            categoriesId: new Map([
                [category1.categoryId.value, category1.categoryId],
            ]),
            genresId: new Map([[genre1.genreId.value, genre1.genreId]]),
            castMembersId: new Map([
                [castMember1.castMemberId.value, castMember1.castMemberId],
            ]),
        });

        const model = VideoModelMapper.toModelProps(entity);
        expect(model).toEqual({
            videoId: videoProps.videoId.value,
            title: videoProps.title,
            description: videoProps.description,
            yearLaunched: videoProps.yearLaunched,
            duration: videoProps.duration,
            rating: videoProps.rating.value,
            isOpened: videoProps.isOpened,
            isPublished: videoProps.isPublished,
            createdAt: videoProps.createdAt,
            audioVideoMedias: [],
            imageMedias: [],
            categoriesId: [
                VideoCategoryModel.build({
                    videoId: videoProps.videoId.value,
                    categoryId: category1.categoryId.value,
                }),
            ],
            genresId: [
                VideoGenreModel.build({
                    videoId: videoProps.videoId.value,
                    genreId: genre1.genreId.value,
                }),
            ],
            castMembersId: [
                VideoCastMemberModel.build({
                    videoId: videoProps.videoId.value,
                    castMemberId: castMember1.castMemberId.value,
                }),
            ],
        });

        entity = new Video({
            ...videoProps,
            banner: new VideoBanner({
                location: 'location banner',
                name: 'name banner',
            }),
            thumbnail: new VideoThumbnail({
                location: 'location thumbnail',
                name: 'name thumbnail',
            }),
            thumbnailHalf: new VideoThumbnailHalf({
                location: 'location thumbnail half',
                name: 'name thumbnail half',
            }),
            trailer: new VideoTrailer({
                name: 'name trailer',
                rawLocation: 'rawLocation trailer',
                encodedLocation: 'encodedLocation trailer',
                status: AudioVideoMediaStatus.COMPLETED,
            }),
            video: new VideoMedia({
                name: 'name video',
                rawLocation: 'rawLocation video',
                encodedLocation: 'encodedLocation video',
                status: AudioVideoMediaStatus.COMPLETED,
            }),
            categoriesId: new Map([
                [category1.categoryId.value, category1.categoryId],
            ]),
            genresId: new Map([[genre1.genreId.value, genre1.genreId]]),
            castMembersId: new Map([
                [castMember1.castMemberId.value, castMember1.castMemberId],
            ]),
        });

        const model2 = VideoModelMapper.toModelProps(entity);
        expect(model2.videoId).toEqual(videoProps.videoId.value);
        expect(model2.title).toEqual(videoProps.title);
        expect(model2.description).toEqual(videoProps.description);
        expect(model2.yearLaunched).toEqual(videoProps.yearLaunched);
        expect(model2.duration).toEqual(videoProps.duration);
        expect(model2.rating).toEqual(videoProps.rating.value);
        expect(model2.isOpened).toEqual(videoProps.isOpened);
        expect(model2.isPublished).toEqual(videoProps.isPublished);
        expect(model2.createdAt).toEqual(videoProps.createdAt);
        expect(model2.audioVideoMedias[0]!.toJSON()).toEqual({
            audioVideoMediaId: model2.audioVideoMedias[0]!.audioVideoMediaId,
            videoId: videoProps.videoId.value,
            name: 'name trailer',
            rawLocation: 'rawLocation trailer',
            encodedLocation: 'encodedLocation trailer',
            status: AudioVideoMediaStatus.COMPLETED,
            videoRelatedField: AudioVideoMediaRelatedField.TRAILER,
        });
        expect(model2.audioVideoMedias[1]!.toJSON()).toEqual({
            audioVideoMediaId: model2.audioVideoMedias[1]!.audioVideoMediaId,
            videoId: videoProps.videoId.value,
            name: 'name video',
            rawLocation: 'rawLocation video',
            encodedLocation: 'encodedLocation video',
            status: AudioVideoMediaStatus.COMPLETED,
            videoRelatedField: AudioVideoMediaRelatedField.VIDEO,
        });
        expect(model2.imageMedias[0]!.toJSON()).toEqual({
            videoImageMediaId: model2.imageMedias[0]!.videoImageMediaId,
            videoId: videoProps.videoId.value,
            location: 'location banner',
            name: 'name banner',
            videoRelatedField: ImageMediaRelatedField.BANNER,
        });
        expect(model2.imageMedias[1]!.toJSON()).toEqual({
            videoImageMediaId: model2.imageMedias[1]!.videoImageMediaId,
            videoId: videoProps.videoId.value,
            location: 'location thumbnail',
            name: 'name thumbnail',
            videoRelatedField: ImageMediaRelatedField.THUMBNAIL,
        });
        expect(model2.imageMedias[2]!.toJSON()).toEqual({
            videoImageMediaId: model2.imageMedias[2]!.videoImageMediaId,
            videoId: videoProps.videoId.value,
            location: 'location thumbnail half',
            name: 'name thumbnail half',
            videoRelatedField: ImageMediaRelatedField.THUMBNAIL_HALF,
        });
        expect(model2.categoriesId[0].toJSON()).toEqual({
            videoId: videoProps.videoId.value,
            categoryId: category1.categoryId.value,
        });
        expect(model2.genresId[0].toJSON()).toEqual({
            videoId: videoProps.videoId.value,
            genreId: genre1.genreId.value,
        });
        expect(model2.castMembersId[0].toJSON()).toEqual({
            videoId: videoProps.videoId.value,
            castMemberId: castMember1.castMemberId.value,
        });
    });

    test('Deve mapear de Entity para Model', async () => {
        const category1 = Category.fake().aCategory().build();
        await categoryRepo.bulkInsert([category1]);
        const genre1 = Genre.fake()
            .aGenre()
            .addCategoryId(category1.categoryId)
            .build();
        await genreRepo.bulkInsert([genre1]);
        const castMember1 = CastMember.fake().anActor().build();
        await castMemberRepo.bulkInsert([castMember1]);

        const videoProps = {
            videoId: new VideoId(),
            title: 'title',
            description: 'description',
            yearLaunched: 2020,
            duration: 90,
            rating: Rating.createR10(),
            isOpened: false,
            isPublished: false,
            createdAt: new Date(),
        };

        let entity = new Video({
            ...videoProps,
            categoriesId: new Map([
                [category1.categoryId.value, category1.categoryId],
            ]),
            genresId: new Map([[genre1.genreId.value, genre1.genreId]]),
            castMembersId: new Map([
                [castMember1.castMemberId.value, castMember1.castMemberId],
            ]),
        });

        const modelInstance = VideoModelMapper.toModel(entity);
        expect(modelInstance).toBeInstanceOf(VideoModel);

        entity = new Video({
            ...videoProps,
            banner: new VideoBanner({
                location: 'location banner',
                name: 'name banner',
            }),
            thumbnail: new VideoThumbnail({
                location: 'location thumbnail',
                name: 'name thumbnail',
            }),
            thumbnailHalf: new VideoThumbnailHalf({
                location: 'location thumbnail half',
                name: 'name thumbnail half',
            }),
            trailer: new VideoTrailer({
                name: 'name trailer',
                rawLocation: 'rawLocation trailer',
                encodedLocation: 'encodedLocation trailer',
                status: AudioVideoMediaStatus.COMPLETED,
            }),
            video: new VideoMedia({
                name: 'name video',
                rawLocation: 'rawLocation video',
                encodedLocation: 'encodedLocation video',
                status: AudioVideoMediaStatus.COMPLETED,
            }),
            categoriesId: new Map([
                [category1.categoryId.value, category1.categoryId],
            ]),
            genresId: new Map([[genre1.genreId.value, genre1.genreId]]),
            castMembersId: new Map([
                [castMember1.castMemberId.value, castMember1.castMemberId],
            ]),
        });

        const model2 = VideoModelMapper.toModel(entity);
        expect(model2).toBeInstanceOf(VideoModel);
    });
});
