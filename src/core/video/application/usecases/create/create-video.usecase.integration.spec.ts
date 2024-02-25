import Video, { VideoId } from '@core/video/domain/video.aggregate';
import IVideoRepository from '@core/video/domain/video.repository.interface';
import IGenreRepository from '@core/genre/domain/genre.repository.interface';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import Category from '@core/category/domain/category.aggregate';
import Genre from '@core/genre/domain/genre.aggregate';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import CreateVideoUseCase from './create-video.usecase';
import CategoriesIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.validation';
import GenresIdsExistsInDatabaseValidation from '@core/genre/application/validations/genres-ids-exists-in-database.validation';
import CastMembersIdsExistsInDatabaseValidation from '@core/cast-member/application/validations/cast-members-ids-exists-in-database.validation';
import Rating from '@core/video/domain/video-rating.vo';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import CategorySequelizeRepository from '@core/category/infra/repositories/category-sequelize.repository';
import GenreSequelizeRepository from '@core/genre/infra/repositories/genre-sequelize.repository';
import CastMemberSequelizeRepository from '@core/cast-member/infra/repositories/cast-member-sequelize.repository';
import { setupDatabaseForVideo } from '@core/video/infra/database/setup-database';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import { GenreModel } from '@core/genre/infra/database/sequelize/models/genre.model';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import VideoSequelizeRepository from '@core/video/infra/repositories/video-sequelize.repository';
import VideoModel, {
    VideoCastMemberModel,
    VideoCategoryModel,
    VideoGenreModel,
} from '@core/video/infra/database/sequelize/models/video.model';
import VideoImageMediaModel from '@core/video/infra/database/sequelize/models/video-image-media.model';
import AudioVideoMediaModel from '@core/video/infra/database/sequelize/models/video-audio-media.model';
import ICategoryIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.interface';
import IGenresIdExistsInDatabaseValidation from '@core/genre/application/validations/genres-ids-exists-in-database.interface';
import ICastMemberIdsExistsInDatabaseValidation from '@core/cast-member/application/validations/cast-members-ids-exists-in-database.interface';

describe('CreateVideoUseCase unit test', () => {
    const setupDatabase = setupDatabaseForVideo();
    let unitOfWork: SequelizeUnitOfWorkRepository;
    let useCase: CreateVideoUseCase;
    let videoRepository: IVideoRepository;
    let genreRepository: IGenreRepository;
    let categoryRepository: ICategoryRepository;
    let castMemberRepository: ICastMemberRepository;
    let categoriesIdsDatabaseValidation: ICategoryIdsExistsInDatabaseValidation;
    let genresIdsDatabaseValidation: IGenresIdExistsInDatabaseValidation;
    let castMembersIdsDatabaseValidation: ICastMemberIdsExistsInDatabaseValidation;

    beforeEach(() => {
        unitOfWork = new SequelizeUnitOfWorkRepository(setupDatabase.sequelize);
        categoryRepository = new CategorySequelizeRepository(CategoryModel);
        videoRepository = new VideoSequelizeRepository(VideoModel, unitOfWork);
        genreRepository = new GenreSequelizeRepository(GenreModel, unitOfWork);
        castMemberRepository = new CastMemberSequelizeRepository(
            CastMemberModel,
        );
        genresIdsDatabaseValidation = new GenresIdsExistsInDatabaseValidation(
            genreRepository,
        );
        categoriesIdsDatabaseValidation =
            new CategoriesIdsExistsInDatabaseValidation(categoryRepository);
        castMembersIdsDatabaseValidation =
            new CastMembersIdsExistsInDatabaseValidation(castMemberRepository);
        useCase = new CreateVideoUseCase(
            unitOfWork,
            videoRepository,
            categoriesIdsDatabaseValidation,
            genresIdsDatabaseValidation,
            castMembersIdsDatabaseValidation,
        );
    });

    test('Deve criar um vídeo', async () => {
        const categories = Category.fake().theCategories(2).build();
        await categoryRepository.bulkInsert(categories);
        const genre = Genre.fake()
            .aGenre()
            .addCategoryId(categories[0].categoryId)
            .build();
        await genreRepository.insert(genre);
        const castMember = CastMember.fake().aDirector().build();
        await castMemberRepository.insert(castMember);

        const spyVideoInsert = jest.spyOn(videoRepository, 'insert');
        const spyGenresIdValidation = jest.spyOn(
            genresIdsDatabaseValidation,
            'validate',
        );
        const spyCategoriesIdValidation = jest.spyOn(
            categoriesIdsDatabaseValidation,
            'validate',
        );
        const spyCastMembersIdValidation = jest.spyOn(
            castMembersIdsDatabaseValidation,
            'validate',
        );

        const video = Video.fake()
            .aVideoWithoutMedias()
            .addGenreId(genre.genreId)
            .addCastMemberId(castMember.castMemberId)
            .addCategoryId(categories[1].categoryId)
            .build();

        const output = await useCase.handle({
            title: video.title,
            description: video.description,
            duration: video.duration,
            isOpened: video.isOpened,
            yearLaunched: video.yearLaunched,
            rating: Rating.createRL().value,
            genresId: Array.from(video.genresId.values()).map((i) => i.value),
            categoriesId: Array.from(video.categoriesId.values()).map(
                (i) => i.value,
            ),
            castMembersId: Array.from(video.castMembersId.values()).map(
                (i) => i.value,
            ),
        });

        await expect(VideoModel.count()).resolves.toBe(1);
        await expect(VideoCategoryModel.count()).resolves.toBe(1);
        await expect(VideoGenreModel.count()).resolves.toBe(1);
        await expect(VideoCastMemberModel.count()).resolves.toBe(1);
        await expect(VideoImageMediaModel.count()).resolves.toBe(0);
        await expect(AudioVideoMediaModel.count()).resolves.toBe(0);

        expect(spyVideoInsert).toHaveBeenCalled();
        expect(spyGenresIdValidation).toHaveBeenCalled();
        expect(spyCategoriesIdValidation).toHaveBeenCalled();
        expect(spyCastMembersIdValidation).toHaveBeenCalled();

        expect(output.id).toBeDefined();
        const videoInserted = await videoRepository.findById(
            new VideoId(output.id),
        );
        expect(videoInserted!.toJSON()).toMatchObject(
            expect.objectContaining({
                ...video.toJSON(),
                videoId: videoInserted!.videoId.value,
                createdAt: videoInserted!.createdAt,
            }),
        );
    });
});
