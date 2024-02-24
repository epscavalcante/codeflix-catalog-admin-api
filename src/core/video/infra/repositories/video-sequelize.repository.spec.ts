import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import { setupDatabaseForVideo } from '../database/setup-database';
import VideoSequelizeRepository from './video-sequelize.repository';
import GenreSequelizeRepository from '@core/genre/infra/repositories/genre-sequelize.repository';
import CastMemberSequelizeRepository from '@core/cast-member/infra/repositories/cast-member-sequelize.repository';
import unitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import VideoModel, {
    VideoCastMemberModel,
    VideoCategoryModel,
    VideoGenreModel,
} from '../database/sequelize/models/video.model';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import { GenreModel } from '@core/genre/infra/database/sequelize/models/genre.model';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import Video, { VideoId } from '@core/video/domain/video.aggregate';
import EntityNotFoundError from '@core/shared/domain/errors/entity-not-found.error';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import VideoVideoImageMediaModel from '../database/sequelize/models/video-image-media.model';
import AudioVideoMediaModel from '../database/sequelize/models/video-audio-media.model';
import VideoImageMediaModel from '../database/sequelize/models/video-image-media.model';
import VideoModelMapper from '../database/sequelize/mappers/video-model.mapper';
import {
    VideoSearchParams,
    VideoSearchResult,
} from '@core/video/domain/video.repository.interface';

describe('VideoSequelizeRepository Integration Tests', () => {
    const sequelizeHelper = setupDatabaseForVideo();
    let videoRepository: VideoSequelizeRepository;
    let categoryRepository: CategorySequelizeRepository;
    let genreRepository: GenreSequelizeRepository;
    let castMemberRepository: CastMemberSequelizeRepository;
    let unitOfWork: unitOfWorkRepository;

    beforeEach(async () => {
        unitOfWork = new SequelizeUnitOfWorkRepository(
            sequelizeHelper.sequelize,
        );
        videoRepository = new VideoSequelizeRepository(VideoModel, unitOfWork);
        categoryRepository = new CategorySequelizeRepository(CategoryModel);
        genreRepository = new GenreSequelizeRepository(GenreModel, unitOfWork);
        castMemberRepository = new CastMemberSequelizeRepository(
            CastMemberModel,
        );
    });

    test('Insert - Deve inserir um vídeo sem as medias', async () => {
        const { category, genre, castMember } = await createRelations();

        const video = Video.fake()
            .aVideoWithoutMedias()
            .addCategoryId(category.categoryId)
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .build();

        await videoRepository.insert(video);
        const newVideo = await videoRepository.findById(video.videoId);

        expect(newVideo!.toJSON()).toStrictEqual(video.toJSON());
    });

    test('Insert - Deve inserir um video com as medias', async () => {
        const { category, genre, castMember } = await createRelations();

        const video = Video.fake()
            .aVideoWithAllMedias()
            .addCategoryId(category.categoryId)
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .build();
        await videoRepository.insert(video);
        const newVideo = await videoRepository.findById(video.videoId);
        expect(newVideo!.toJSON()).toStrictEqual(video.toJSON());
    });

    test('BulkInsert - Deve inserir varios videos sem medias', async () => {
        const { category, genre, castMember } = await createRelations();

        const videos = Video.fake()
            .theVideosWithoutMedias(2)
            .addCategoryId(category.categoryId)
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .build();
        await videoRepository.bulkInsert(videos);
        const newVideos = await videoRepository.findAll();
        expect(newVideos.length).toBe(2);
        expect(newVideos[0].toJSON()).toStrictEqual(videos[0].toJSON());
        expect(newVideos[1].toJSON()).toStrictEqual(videos[1].toJSON());
    });

    test('BulkInsert - Deve inserir vários videos com medias', async () => {
        const { category, genre, castMember } = await createRelations();

        const videos = Video.fake()
            .theVideosWithAllMedias(2)
            .addCategoryId(category.categoryId)
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .build();
        await videoRepository.bulkInsert(videos);
        const newVideos = await videoRepository.findAll();
        expect(newVideos.length).toBe(2);
        expect(newVideos[0].toJSON()).toStrictEqual(videos[0].toJSON());
        expect(newVideos[1].toJSON()).toStrictEqual(videos[1].toJSON());
    });

    test('FindById - Deve encontrar um vídeo sem medias', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
            .aVideoWithoutMedias()
            .addCategoryId(category.categoryId)
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .build();
        await videoRepository.insert(video);

        const entityFound = await videoRepository.findById(video.videoId);
        expect(video.toJSON()).toStrictEqual(entityFound!.toJSON());
    });

    test('FindById - Deve encontrar um video com as medias', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
            .aVideoWithAllMedias()
            .addCategoryId(category.categoryId)
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .build();
        await videoRepository.insert(video);

        const entityFound = await videoRepository.findById(video.videoId);
        expect(video.toJSON()).toStrictEqual(entityFound!.toJSON());
    });

    test('FindAll - deve retornar todos os videos (sem medias)', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
            .aVideoWithoutMedias()
            .addCategoryId(category.categoryId)
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .build();
        await videoRepository.insert(video);

        const videos = await videoRepository.findAll();
        expect([video.toJSON()]).toStrictEqual([videos[0].toJSON()]);
    });

    test('FindAll - Deve retornar todos os videos (com medias)', async () => {
        const { category, genre, castMember } = await createRelations();
        const video = Video.fake()
            .aVideoWithAllMedias()
            .addCategoryId(category.categoryId)
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .build();
        await videoRepository.insert(video);

        const videos = await videoRepository.findAll();
        expect([video.toJSON()]).toStrictEqual([videos[0].toJSON()]);
    });

    test('Error - 404 ao atualizar um vidoe que não existe', async () => {
        const entity = Video.fake().aVideoWithoutMedias().build();
        await expect(videoRepository.update(entity)).rejects.toThrow(
            new EntityNotFoundError(entity.videoId.value, Video),
        );
    });

    test('Update - Deve atualizar um vídeo', async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepository.bulkInsert(categories);
        const genres = Genre.fake()
            .theGenres(3)
            .addCategoryId(categories[0].categoryId)
            .build();
        await genreRepository.bulkInsert(genres);
        const castMembers = CastMember.fake().theCastMembers(3).build();
        await castMemberRepository.bulkInsert(castMembers);
        const fakerVideo = Video.fake().aVideoWithoutMedias();
        const video = Video.fake()
            .aVideoWithoutMedias()
            .addCategoryId(categories[0].categoryId)
            .addGenreId(genres[0].genreId)
            .addCastMemberId(castMembers[0].castMemberId)
            .build();
        await videoRepository.insert(video);

        video.changeTitle('Title changed');
        video.syncCategoriesId([categories[1].categoryId]);
        video.syncGenresId([genres[1].genreId]);
        video.syncCastMembersId([castMembers[1].castMemberId]);
        await videoRepository.update(video);

        let videoUpdated = await videoRepository.findById(video.videoId);

        expect(video.toJSON()).toStrictEqual(videoUpdated!.toJSON());
        await expect(VideoCategoryModel.count()).resolves.toBe(1);
        await expect(VideoGenreModel.count()).resolves.toBe(1);
        await expect(VideoCastMemberModel.count()).resolves.toBe(1);

        video.changeBanner(fakerVideo.banner);
        video.changeThumbnail(fakerVideo.thumbnail);
        video.changeThumbnailHalf(fakerVideo.thumbnailHalf);
        video.changeTrailer(fakerVideo.trailer);
        video.changeVideo(fakerVideo.video);

        await videoRepository.update(video);

        videoUpdated = await videoRepository.findById(video.videoId);
        expect(video.toJSON()).toStrictEqual(videoUpdated!.toJSON());
        await expect(VideoCategoryModel.count()).resolves.toBe(1);
        await expect(VideoGenreModel.count()).resolves.toBe(1);
        await expect(VideoCastMemberModel.count()).resolves.toBe(1);
        await expect(VideoVideoImageMediaModel.count()).resolves.toBe(3);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(2);

        video.changeBanner(fakerVideo.banner);
        video.changeThumbnail(fakerVideo.thumbnail);
        video.changeThumbnailHalf(fakerVideo.thumbnailHalf);
        video.changeTrailer(fakerVideo.trailer);
        video.changeVideo(fakerVideo.video);

        await videoRepository.update(video);

        videoUpdated = await videoRepository.findById(video.videoId);
        expect(video.toJSON()).toStrictEqual(videoUpdated!.toJSON());
        await expect(VideoCategoryModel.count()).resolves.toBe(1);
        await expect(VideoGenreModel.count()).resolves.toBe(1);
        await expect(VideoCastMemberModel.count()).resolves.toBe(1);
        await expect(VideoImageMediaModel.count()).resolves.toBe(3);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(2);
    });

    test('Error - 404 ao excluir um vídeo que não existe.', async () => {
        const videoId = new VideoId();
        await expect(videoRepository.delete(videoId)).rejects.toThrow(
            new EntityNotFoundError(videoId.value, Video),
        );
    });

    test('Destroy - Deve excluir um vídeo', async () => {
        const { category, genre, castMember } = await createRelations();
        let video = Video.fake()
            .aVideoWithoutMedias()
            .addCategoryId(category.categoryId)
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .build();
        await videoRepository.insert(video);

        await videoRepository.delete(video.videoId);
        let videoFound = await VideoModel.findByPk(video.videoId.value);
        expect(videoFound).toBeNull();
        await expect(VideoCategoryModel.count()).resolves.toBe(0);
        await expect(VideoGenreModel.count()).resolves.toBe(0);
        await expect(VideoCastMemberModel.count()).resolves.toBe(0);

        video = Video.fake()
            .aVideoWithAllMedias()
            .addCategoryId(category.categoryId)
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .build();
        await videoRepository.insert(video);
        await videoRepository.delete(video.videoId);
        videoFound = await VideoModel.findByPk(video.videoId.value);
        expect(videoFound).toBeNull();
        await expect(VideoCategoryModel.count()).resolves.toBe(0);
        await expect(VideoGenreModel.count()).resolves.toBe(0);
        await expect(VideoCastMemberModel.count()).resolves.toBe(0);
        await expect(VideoImageMediaModel.count()).resolves.toBe(0);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(0);
    });

    describe('Search - search method tests', () => {
        test('Deve ordenar pelo createdAt quando não passado nenhum parametro', async () => {
            const { category, genre, castMember } = await createRelations();

            const videos = Video.fake()
                .theVideosWithAllMedias(16)
                .withCreatedAt(
                    (index) => new Date(new Date().getTime() + 100 + index),
                )
                .addCategoryId(category.categoryId)
                .addGenreId(genre.genreId)
                .addCastMemberId(castMember.castMemberId)
                .build();
            await videoRepository.bulkInsert(videos);
            const spyToEntity = jest.spyOn(VideoModelMapper, 'toEntity');
            const searchOutput = await videoRepository.search(
                VideoSearchParams.create(),
            );
            expect(searchOutput).toBeInstanceOf(VideoSearchResult);
            expect(spyToEntity).toHaveBeenCalledTimes(15);
            expect(searchOutput.toJSON()).toMatchObject({
                total: 16,
                currentPage: 1,
                lastPage: 2,
                perPage: 15,
            });

            [...videos.slice(1, 16)].reverse().forEach((item, index) => {
                expect(searchOutput.items[index]).toBeInstanceOf(Video);
                const expected = searchOutput.items[index].toJSON();
                expect(item.toJSON()).toStrictEqual({
                    ...expected,
                    categoriesId: [category.categoryId.value],
                    genresId: [genre.genreId.value],
                    castMembersId: [castMember.castMemberId.value],
                });
            });
        });

        test('Deve aplicar paginação e filtro por título (title)', async () => {
            const { category, genre, castMember } = await createRelations();
            const videos = [
                Video.fake()
                    .aVideoWithAllMedias()
                    .withTitle('test')
                    .withCreatedAt(new Date(new Date().getTime() + 4000))
                    .addCategoryId(category.categoryId)
                    .addGenreId(genre.genreId)
                    .addCastMemberId(castMember.castMemberId)
                    .build(),
                Video.fake()
                    .aVideoWithAllMedias()
                    .withTitle('a')
                    .withCreatedAt(new Date(new Date().getTime() + 3000))
                    .addCategoryId(category.categoryId)
                    .addGenreId(genre.genreId)
                    .addCastMemberId(castMember.castMemberId)
                    .build(),
                Video.fake()
                    .aVideoWithAllMedias()
                    .withTitle('TEST')
                    .withCreatedAt(new Date(new Date().getTime() + 2000))
                    .addCategoryId(category.categoryId)
                    .addGenreId(genre.genreId)
                    .addCastMemberId(castMember.castMemberId)
                    .build(),
                Video.fake()
                    .aVideoWithAllMedias()
                    .withTitle('TeSt')
                    .withCreatedAt(new Date(new Date().getTime() + 1000))
                    .addCategoryId(category.categoryId)
                    .addGenreId(genre.genreId)
                    .addCastMemberId(castMember.castMemberId)
                    .build(),
            ];
            await videoRepository.bulkInsert(videos);

            let searchOutput = await videoRepository.search(
                VideoSearchParams.create({
                    page: 1,
                    perPage: 2,
                    filter: { title: 'TEST' },
                }),
            );

            let expected = new VideoSearchResult({
                items: [videos[0], videos[2]],
                total: 3,
                currentPage: 1,
                perPage: 2,
            }).toJSON(true);
            expect(searchOutput.toJSON(true)).toMatchObject({
                ...expected,
                items: [
                    {
                        ...expected.items[0],
                        categoriesId: [category.categoryId.value],
                        genresId: [genre.genreId.value],
                        castMembersId: [castMember.castMemberId.value],
                    },
                    {
                        ...expected.items[1],
                        categoriesId: [category.categoryId.value],
                        genresId: [genre.genreId.value],
                        castMembersId: [castMember.castMemberId.value],
                    },
                ],
            });

            expected = new VideoSearchResult({
                items: [videos[3]],
                total: 3,
                currentPage: 2,
                perPage: 2,
            }).toJSON(true);
            searchOutput = await videoRepository.search(
                VideoSearchParams.create({
                    page: 2,
                    perPage: 2,
                    filter: { title: 'TEST' },
                }),
            );
            expect(searchOutput.toJSON(true)).toMatchObject({
                ...expected,
                items: [
                    {
                        ...expected.items[0],
                    },
                ],
            });
        });
    });

    async function createRelations() {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);
        const genre = Genre.fake()
            .aGenre()
            .addCategoryId(category.categoryId)
            .build();
        await genreRepository.insert(genre);
        const castMember = CastMember.fake().anActor().build();
        await castMemberRepository.insert(castMember);
        return { category, genre, castMember };
    }
});
