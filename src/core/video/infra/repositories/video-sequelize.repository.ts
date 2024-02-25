import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';
import IVideoRepository, {
    VideoSearchParams,
    VideoSearchResult,
} from '@core/video/domain/video.repository.interface';
import VideoModel from '../database/sequelize/models/video.model';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import Video, { VideoId } from '@core/video/domain/video.aggregate';
import VideoModelMapper from '../database/sequelize/mappers/video-model.mapper';
import { Op, literal } from 'sequelize';
import VideoNotFoundError from '@core/video/domain/errors/video-not-found.error';

export default class VideoSequelizeRepository implements IVideoRepository {
    sortableFields: string[] = ['title', 'createdAt'];
    orderBy = {
        mysql: {
            title: (sortDir: SortDirection) =>
                `binary ${this.videoModel.name}.title ${sortDir}`,
            createdAt: (sortDir: SortDirection) =>
                `binary ${this.videoModel.name}.created_at ${sortDir}`,
        },
    };
    relationsIncluded = [
        'categoriesId',
        'castMembersId',
        'genresId',
        'imageMedias',
        'audioVideoMedias',
    ];

    constructor(
        private videoModel: typeof VideoModel,
        private unitOfWork: SequelizeUnitOfWorkRepository,
    ) {}

    async insert(video: Video): Promise<void> {
        const model = VideoModelMapper.toModelProps(video);
        await this.videoModel.create(model, {
            include: this.relationsIncluded,
            transaction: this.unitOfWork.getTransaction(),
        });
        this.unitOfWork.addAggregateRoot(video);
    }

    async bulkInsert(videos: Video[]): Promise<void> {
        const videosModel = videos.map((video) =>
            VideoModelMapper.toModelProps(video),
        );

        await this.videoModel.bulkCreate(videosModel, {
            include: this.relationsIncluded,
            transaction: this.unitOfWork.getTransaction(),
        });

        videos.forEach((video) => this.unitOfWork.addAggregateRoot(video));
    }

    async update(video: Video): Promise<void> {
        const model = await this._get(video.videoId.value);
        if (!model) throw new VideoNotFoundError(video.videoId.value);

        await this._removeAllRelationsAndMedias(model);

        const modelProps = VideoModelMapper.toModelProps(video);

        await this.videoModel.update(modelProps, {
            where: {
                videoId: video.videoId.value,
            },
            transaction: this.unitOfWork.getTransaction(),
        });

        await Promise.all([
            ...modelProps.imageMedias.map((videoImageMediaModel) =>
                model.$create('imageMedia', videoImageMediaModel.toJSON(), {
                    transaction: this.unitOfWork.getTransaction(),
                }),
            ),
            ...modelProps.audioVideoMedias.map((audioVideoImageMediaModel) =>
                model.$create(
                    'audioVideoMedia',
                    audioVideoImageMediaModel.toJSON(),
                    {
                        transaction: this.unitOfWork.getTransaction(),
                    },
                ),
            ),
            model.$add(
                'categories',
                modelProps.categoriesId.map(
                    (videoCategoryModel) => videoCategoryModel.categoryId,
                ),
                { transaction: this.unitOfWork.getTransaction() },
            ),
            model.$add(
                'genres',
                modelProps.genresId.map(
                    (videoGenreModel) => videoGenreModel.genreId,
                ),
                { transaction: this.unitOfWork.getTransaction() },
            ),
            model.$add(
                'castMembers',
                modelProps.castMembersId.map(
                    (videoCastMemberModel) => videoCastMemberModel.castMemberId,
                ),
                { transaction: this.unitOfWork.getTransaction() },
            ),
        ]);

        this.unitOfWork.addAggregateRoot(video);
    }

    async delete(videoId: VideoId): Promise<void> {
        const model = await this._get(videoId.value);
        if (!model) throw new VideoNotFoundError(videoId.value);

        await this._removeAllRelationsAndMedias(model);

        const effectedRows = await this.videoModel.destroy({
            where: { videoId: videoId.value },
            transaction: this.unitOfWork.getTransaction(),
        });

        if (effectedRows !== 1) throw new VideoNotFoundError(videoId.value);
        this.unitOfWork.addAggregateRoot(VideoModelMapper.toEntity(model));
    }

    async findAll(): Promise<Video[]> {
        const videosModel = await VideoModel.findAll({
            include: this.relationsIncluded,
            transaction: this.unitOfWork.getTransaction(),
        });

        return videosModel.map((model) => VideoModelMapper.toEntity(model));
    }

    async findById(videoId: VideoId): Promise<Video | null> {
        const videoModel = await this._get(videoId.value);

        return videoModel ? VideoModelMapper.toEntity(videoModel) : null;
    }

    async findByIds(ids: VideoId[]): Promise<Video[]> {
        const models = await this.videoModel.findAll({
            where: {
                videoId: {
                    [Op.in]: ids.map((videoId) => videoId.value),
                },
            },
            include: this.relationsIncluded,
            transaction: this.unitOfWork.getTransaction(),
        });

        return models.map((model) => VideoModelMapper.toEntity(model));
    }

    async existsByIds(
        ids: VideoId[],
    ): Promise<{ exists: VideoId[]; notExists: VideoId[] }> {
        if (ids.length === 0) {
            return {
                exists: [],
                notExists: ids,
            };
        }

        const models = await this.videoModel.findAll({
            attributes: ['videoId'],
            where: {
                videoId: {
                    [Op.in]: ids.map((videoId) => videoId.value),
                },
            },
            transaction: this.unitOfWork.getTransaction(),
        });

        const existsIds = models.map((model) => new VideoId(model.videoId));
        const notExistsIds = ids.filter(
            (videoId) => !existsIds.some((existId) => existId.equals(videoId)),
        );
        return {
            exists: existsIds,
            notExists: notExistsIds,
        };
    }

    async search(props: VideoSearchParams): Promise<VideoSearchResult> {
        const offset = (props.page - 1) * props.perPage;
        const limit = props.perPage;
        const videoCategoryRelation =
            this.videoModel.associations.categoriesId.target;
        const videoGenreRelation = this.videoModel.associations.genresId.target;
        const videoCastMemberRelation =
            this.videoModel.associations.castMembersId.target;
        const videoTableName = this.videoModel.getTableName();
        const videoCategoryTableName = videoCategoryRelation.getTableName();
        const videoGenreTableName = videoGenreRelation.getTableName();
        const videoCastMemberTableName = videoCastMemberRelation.getTableName();
        const videoTableAlias = this.videoModel.name;

        const wheres: any[] = [];

        if (
            props.filter &&
            (props.filter.title ||
                props.filter.categoriesId ||
                props.filter.genresId ||
                props.filter.castMembersId)
        ) {
            if (props.filter.title) {
                wheres.push({
                    field: 'title',
                    value: `%${props.filter.title}%`,
                    get condition() {
                        return {
                            [this.field]: {
                                [Op.like]: this.value,
                            },
                        };
                    },
                    rawCondition: `${videoTableAlias}.title LIKE :title`,
                });
            }

            if (props.filter.categoriesId) {
                wheres.push({
                    field: 'categoriesId',
                    value: props.filter.categoriesId.map(
                        (categoryId) => categoryId.value,
                    ),
                    get condition() {
                        return {
                            ['$categoriesId.category_id$']: {
                                [Op.in]: this.value,
                            },
                        };
                    },
                    rawCondition: `${videoCategoryTableName}.category_id IN (:categoriesId)`,
                });
            }

            if (props.filter.genresId) {
                wheres.push({
                    field: 'genresId',
                    value: props.filter.genresId.map(
                        (genreId) => genreId.value,
                    ),
                    get condition() {
                        return {
                            ['$genresId.genre_id$']: {
                                [Op.in]: this.value,
                            },
                        };
                    },
                    rawCondition: `${videoGenreTableName}.genre_id IN (:genresId)`,
                });
            }

            if (props.filter.castMembersId) {
                wheres.push({
                    field: 'castMembersId',
                    value: props.filter.castMembersId.map(
                        (castMemberId) => castMemberId.value,
                    ),
                    get condition() {
                        return {
                            ['$castMembersId.cast_member_id$']: {
                                [Op.in]: this.value,
                            },
                        };
                    },
                    rawCondition: `${videoCastMemberTableName}.cast_member_id IN (:castMembersId)`,
                });
            }
        }

        const orderBy =
            props.sort && this.sortableFields.includes(props.sort)
                ? this.formatSort(props.sort, props.sortDir!)
                : `${videoTableAlias}.\`created_at\` DESC`;

        // @ts-expect-error  - count is a number
        const count: number = await this.videoModel.count({
            distinct: true,
            //@ts-expect-error - add include only if categories_id is defined
            include: [
                props.filter?.categoriesId && 'categoriesId',
                props.filter?.genresId && 'genresId',
                props.filter?.castMembersId && 'castMembersId',
            ].filter((i) => i),
            where: wheres.length
                ? { [Op.and]: wheres.map((w) => w.condition) }
                : {},
            transaction: this.unitOfWork.getTransaction(),
        });

        const columnOrder = orderBy.replace('binary', '').trim().split(' ')[0];

        const query = [
            'SELECT',
            `DISTINCT ${videoTableAlias}.\`video_id\`,${columnOrder} FROM ${videoTableName} as ${videoTableAlias}`,
            props.filter?.categoriesId
                ? `INNER JOIN ${videoCategoryTableName} ON ${videoTableAlias}.\`video_id\` = ${videoCategoryTableName}.\`video_id\``
                : '',
            props.filter?.genresId
                ? `INNER JOIN ${videoGenreTableName} ON ${videoTableAlias}.\`video_id\` = ${videoGenreTableName}.\`video_id\``
                : '',
            props.filter?.castMembersId
                ? `INNER JOIN ${videoCastMemberTableName} ON ${videoTableAlias}.\`video_id\` = ${videoCastMemberTableName}.\`video_id\``
                : '',
            wheres.length
                ? `WHERE ${wheres.map((w) => w.rawCondition).join(' AND ')}`
                : '',
            `ORDER BY ${orderBy}`,
            `LIMIT ${limit}`,
            `OFFSET ${offset}`,
        ];

        const [idsResult] = await this.videoModel.sequelize!.query(
            query.join(' '),
            {
                replacements: wheres.reduce(
                    (acc, w) => ({ ...acc, [w.field]: w.value }),
                    {},
                ),
                transaction: this.unitOfWork.getTransaction(),
            },
        );

        const models = await this.videoModel.findAll({
            where: {
                videoId: {
                    [Op.in]: idsResult.map(
                        (id: { video_id: string }) => id.video_id,
                    ) as string[],
                },
            },
            include: this.relationsIncluded,
            order: literal(orderBy),
            transaction: this.unitOfWork.getTransaction(),
        });

        return new VideoSearchResult({
            total: count,
            currentPage: props.page,
            perPage: props.perPage,
            items: models.map((videoModel) =>
                VideoModelMapper.toEntity(videoModel),
            ),
        });
    }

    getEntity(): new (...args: any[]) => Video {
        return Video;
    }

    private _removeAllRelationsAndMedias(model: VideoModel) {
        return Promise.all([
            ...model.imageMedias.map((videoImageMediaModel) =>
                videoImageMediaModel.destroy({
                    transaction: this.unitOfWork.getTransaction(),
                }),
            ),
            ...model.audioVideoMedias.map((audioVideoImageMedia) =>
                audioVideoImageMedia.destroy({
                    transaction: this.unitOfWork.getTransaction(),
                }),
            ),
            model.$remove(
                'categories',
                model.categoriesId.map(
                    (videoCategoryModel) => videoCategoryModel.categoryId,
                ),
                {
                    transaction: this.unitOfWork.getTransaction(),
                },
            ),
            model.$remove(
                'genres',
                model.genresId.map(
                    (videoGenreModel) => videoGenreModel.genreId,
                ),
                {
                    transaction: this.unitOfWork.getTransaction(),
                },
            ),
            model.$remove(
                'castMembers',
                model.castMembersId.map(
                    (videoCastMemberModel) => videoCastMemberModel.castMemberId,
                ),
                {
                    transaction: this.unitOfWork.getTransaction(),
                },
            ),
        ]);
    }

    private async _get(id: string) {
        return await VideoModel.findByPk(id, {
            include: this.relationsIncluded,
            transaction: this.unitOfWork.getTransaction(),
        });
    }

    private formatSort(sort: string, sortDir: SortDirection) {
        const dialect = this.videoModel.sequelize!.getDialect() as 'mysql';
        if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
            return this.orderBy[dialect][sort](sortDir);
        }
        return `${this.videoModel.name}.\`${sort}\` ${sortDir}`;
    }
}
