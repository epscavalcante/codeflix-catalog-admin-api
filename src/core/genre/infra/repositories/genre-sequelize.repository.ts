import IGenreRepository, {
    GenreSearchParams,
    GenreSearchResult,
} from '@core/genre/domain/genre.repository.interface';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';
import { Op, literal, where } from 'sequelize';
import { GenreModel } from '../database/sequelize/models/genre.model';
import SequelizeUnitOfWorkRepository from '@core/shared/infra/repositories/sequelize-unit-of-work.repository';
import Genre from '@core/genre/domain/genre.aggregate';
import { GenreModelMapper } from '../database/mappers/genre-model.mapper';
import { GenreNotFoundError } from '@core/genre/domain/errors/genre-not-found.error';
import GenreId from '@core/genre/domain/genre.id.vo';

export default class GenreSequelizeRepository implements IGenreRepository {
    sortableFields: string[] = ['name', 'createdAt'];
    orderBy = {
        mysql: {
            name: (sortDir: SortDirection) => `binary ${this.genreModel.name}.name ${sortDir}`,
            createdAt: (sortDir: SortDirection) => `binary ${this.genreModel.name}.created_at ${sortDir}`,
        },
    };

    constructor(
        private genreModel: typeof GenreModel,
        private unitOfWork: SequelizeUnitOfWorkRepository,
    ) {}

    async insert(genre: Genre): Promise<void> {
        const model = GenreModelMapper.toModelProps(genre);
        await this.genreModel.create(model, {
            include: ['categoriesId'],
            transaction: this.unitOfWork.getTransaction(),
        });
    }

    async bulkInsert(genres: Genre[]): Promise<void> {
        const genresModel = genres.map((genre) =>
            GenreModelMapper.toModelProps(genre)
        );

        await this.genreModel.bulkCreate(genresModel, {
            include: ['categoriesId'],
            transaction: this.unitOfWork.getTransaction(),
        });
    }

    async update(genre: Genre): Promise<void> {
        const id = genre.genreId.value;
        const model = await this._get(id);
        if (!model) throw new GenreNotFoundError(id);
        model.$remove(
            'categories',
            model.categoriesId.map((categoryId) => categoryId.categoryId),
            {
                transaction: this.unitOfWork.getTransaction(),
            },
        );
        const { categoriesId, ...props } = GenreModelMapper.toModelProps(genre);
        const [effectedRows] = await this.genreModel.update(props, {
            where: { genreId: id },
            transaction: this.unitOfWork.getTransaction(),
        });

        await model.$add(
            'categories',
            categoriesId.map((categoryId) => categoryId.categoryId),
            {
                transaction: this.unitOfWork.getTransaction(),
            },
        );

        if (effectedRows !== 1) throw new GenreNotFoundError(model.genreId);
    }

    async delete(genreId: GenreId): Promise<void> {
        const genreCategoryRelation =
            this.genreModel.associations.categoriesId.target;
        await genreCategoryRelation.destroy({
            where: { genreId: genreId.value },
            transaction: this.unitOfWork.getTransaction(),
        });
        const effectedRows = await this.genreModel.destroy({
            where: { genreId: genreId.value },
            transaction: this.unitOfWork.getTransaction(),
        });

        if (effectedRows !== 1) throw new GenreNotFoundError(genreId.value);
    }

    async findAll(): Promise<Genre[]> {
        const genresModel = await GenreModel.findAll({
            include: ['categoriesId'],
            transaction: this.unitOfWork.getTransaction(),
        });

        return genresModel.map((model) => GenreModelMapper.toEntity(model));
    }

    async findById(genreId: GenreId): Promise<Genre | null> {
        const genreModel = await this._get(genreId.value);

        return genreModel ? GenreModelMapper.toEntity(genreModel) : null;
    }

    async findByIds(ids: GenreId[]): Promise<Genre[]> {
        const models = await this.genreModel.findAll({
            where: {
                genreId: {
                    [Op.in]: ids.map(
                        (genreId) => genreId.value,
                    ),
                },
            },
        });

        return models.map((model) =>
            GenreModelMapper.toEntity(model),
        );
    }

    async existsByIds(
        ids: GenreId[],
    ): Promise<{ exists: GenreId[]; notExists: GenreId[] }> {
        if (ids.length === 0) {
            return {
                exists: [],
                notExists: ids,
            };
        }

        const models = await this.genreModel.findAll({
            where: {
                genreId: {
                    [Op.in]: ids.map((genreId) => genreId.value),
                },
            },
        });

        const existsIds = models.map(
            (model) => new GenreId(model.genreId),
        );
        const notExistsIds = ids.filter(
            (genreId) =>
                !existsIds.some((existId) =>
                    existId.equals(genreId),
                ),
        );
        return {
            exists: existsIds,
            notExists: notExistsIds,
        };
    }

    async search(props: GenreSearchParams): Promise<GenreSearchResult> {
        const offset = (props.page - 1) * props.perPage;
        const limit = props.perPage;
        const genreCategoryRelation =
            this.genreModel.associations.categoriesId.target;
        const genreTableName = this.genreModel.getTableName();
        const genreCategoryTableName = genreCategoryRelation.getTableName();
        const genreTableAlias = this.genreModel.name;

        const wheres: any[] = [];

        if (props.filter && (props.filter.name || props.filter.categoriesId)) {
            if (props.filter.name) {
                wheres.push({
                    field: 'name',
                    value: `%${props.filter.name}%`,
                    get condition() {
                        return {
                            [this.field]: {
                                [Op.like]: this.value,
                            },
                        };
                    },
                    rawCondition: `${genreTableAlias}.name LIKE :name`,
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
                    rawCondition: `${genreCategoryTableName}.category_id IN (:categoriesId)`,
                });
            }
        }

        const orderBy =
            props.sort && this.sortableFields.includes(props.sort)
                ? this.formatSort(props.sort, props.sortDir!)
                : `${genreTableAlias}.\`created_at\` DESC`;

        // @ts-expect-error  - count is a number
        const count: number = await this.genreModel.count({
            distinct: true,
            //@ts-expect-error - add include only if categories_id is defined
            include: [props.filter?.categoriesId && 'categoriesId'].filter(
                (i) => i,
            ),
            where: wheres.length
                ? { [Op.and]: wheres.map((w) => w.condition) }
                : {},
            transaction: this.unitOfWork.getTransaction(),
        });

        const columnOrder = orderBy.replace('binary', '').trim().split(' ')[0];

        const query = [
            'SELECT',
            `DISTINCT ${genreTableAlias}.\`genre_id\`,${columnOrder} FROM ${genreTableName} as ${genreTableAlias}`,
            props.filter?.categoriesId
                ? `INNER JOIN ${genreCategoryTableName} ON ${genreTableAlias}.\`genre_id\` = ${genreCategoryTableName}.\`genre_id\``
                : '',
            wheres.length
                ? `WHERE ${wheres.map((w) => w.rawCondition).join(' AND ')}`
                : '',
            `ORDER BY ${orderBy}`,
            `LIMIT ${limit}`,
            `OFFSET ${offset}`,
        ];

        const [idsResult] = await this.genreModel.sequelize!.query(
            query.join(' '),
            {
                replacements: wheres.reduce(
                    (acc, w) => ({ ...acc, [w.field]: w.value }),
                    {},
                ),
                transaction: this.unitOfWork.getTransaction(),
            },
        );

        const models = await this.genreModel.findAll({
            where: {
                genreId: {
                    [Op.in]: idsResult.map(
                        (id: { genre_id: string }) => id.genre_id,
                    ) as string[],
                },
            },
            include: ['categoriesId'],
            order: literal(orderBy),
            transaction: this.unitOfWork.getTransaction(),
        });

        return new GenreSearchResult({
            total: count,
            currentPage: props.page,
            perPage: props.perPage,
            items: models.map((genreModel) =>
                GenreModelMapper.toEntity(genreModel),
            ),
        });
    }

    getEntity(): new (...args: any[]) => Genre {
        return Genre;
    }

    private async _get(id: string) {
        return await GenreModel.findByPk(id, {
            include: ['categoriesId'],
            transaction: this.unitOfWork.getTransaction(),
        });
    }

    private formatSort(sort: string, sortDir: SortDirection) {
        const dialect = this.genreModel.sequelize!.getDialect() as 'mysql';
        if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
            return this.orderBy[dialect][sort](sortDir);
        }
        return `${this.genreModel.name}.\`${sort}\` ${sortDir}`;
    }
}
