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
            name: (sortDir: SortDirection) => literal(`binary name ${sortDir}`),
        },
    };

    constructor(
        private genreModel: typeof GenreModel,
        private unitOfWork: SequelizeUnitOfWorkRepository,
    ) {}

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
                    field: 'categories_id',
                    value: props.filter.categoriesId.map(
                        (categoryId) => categoryId.value,
                    ),
                    get condition() {
                        return {
                            ['$categoriesId.categoryId$']: {
                                [Op.in]: this.value,
                            },
                        };
                    },
                    rawCondition: `${genreCategoryTableName}.categoryId IN (:categoriesId)`,
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

        console.log(query);

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

        console.log(idsResult);

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

        console.log('result', models.map((genreModel) =>
            GenreModelMapper.toEntity(genreModel),
        ));

        return new GenreSearchResult({
            total: count,
            currentPage: props.page,
            perPage: props.perPage,
            items: models.map((genreModel) =>
                GenreModelMapper.toEntity(genreModel),
            ),
        });
    }

    async insert(genre: Genre): Promise<void> {
        const model = GenreModelMapper.toModel(genre);

        await this.genreModel.create(model.toJSON(), {
            include: ['categoriesId'],
            transaction: this.unitOfWork.getTransaction(),
        });
    }

    async bulkInsert(genres: Genre[]): Promise<void> {
        const genresModel = genres.map((genre) =>
            GenreModelMapper.toModel(genre).toJSON(),
        );

        await this.genreModel.bulkCreate(genresModel, {
            include: ['categoriesId'],
            transaction: this.unitOfWork.getTransaction(),
        });
    }

    async update(genre: Genre): Promise<void> {
        const id = genre.genreId.value;
        const castModelToUpdate = GenreModelMapper.toModel(genre);

        const [effectedRows] = await this.genreModel.update(
            castModelToUpdate.toJSON(),
            {
                where: { genreId: id },
            },
        );

        if (effectedRows !== 1) {
            throw new GenreNotFoundError(id);
        }
    }

    async delete(genreId: GenreId): Promise<void> {
        const effectedRows = await this.genreModel.destroy({
            where: { genreId: genreId.value },
            transaction: this.unitOfWork.getTransaction(),
        });

        if (effectedRows !== 1) {
            throw new GenreNotFoundError(genreId.value);
        }
    }

    async findAll(): Promise<Genre[]> {
        const genresModel = await GenreModel.findAll({
            transaction: this.unitOfWork.getTransaction(),
        });

        return genresModel.map((model) => GenreModelMapper.toEntity(model));
    }

    async findById(genreId: GenreId): Promise<Genre | null> {
        const genreModel = await this._get(genreId.value);

        return genreModel ? GenreModelMapper.toEntity(genreModel) : null;
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
        return `${this.genreModel.name}.\${sort}\ ${sortDir}`;
    }
}
