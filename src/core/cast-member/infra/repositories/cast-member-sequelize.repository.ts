import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import CastMemberRepository, {
    CastMemberSearchParams,
    CastMemberSearchResult,
} from '@core/cast-member/domain/cast-member.repository.interface';
import CastMemberModel from '../database/sequelize/models/cast-member.model';
import CastMemberMapper from '../database/sequelize/mapper/cast-member.mapper';
import { Op, literal } from 'sequelize';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';
import { CastMemberNotFoundError } from '@core/cast-member/domain/errors/cast-member-not-found.error';

export default class CastMemberSequelizeRepository
    implements CastMemberRepository
{
    sortableFields: string[] = ['name', 'createdAt'];
    orderBy = {
        mysql: {
            name: (sort_dir: SortDirection) =>
                literal(`binary name ${sort_dir}`),
        },
    };

    constructor(private castMemberModel: typeof CastMemberModel) {}

    async search(
        props: CastMemberSearchParams,
    ): Promise<CastMemberSearchResult> {
        const offset = (props.page - 1) * props.perPage;
        const limit = props.perPage;

        const where = {};

        if (props.filter && (props.filter.name || props.filter.type)) {
            if (props.filter.name) {
                where['name'] = { [Op.like]: `%${props.filter.name}%` };
            }

            if (props.filter.type) {
                where['type'] = props.filter.type?.value;
            }
        }

        const { rows: castMembersModel, count: total } =
            await this.castMemberModel.findAndCountAll({
                ...(props.filter && {
                    where,
                }),
                ...(props.sort && this.sortableFields.includes(props.sort)
                    ? {
                          order: this.formatSort(
                              props.sort,
                              props.sortDir || 'desc',
                          ),
                      }
                    : { order: [['created_at', 'desc']] }),
                offset,
                limit,
            });

        return new CastMemberSearchResult({
            total,
            currentPage: props.page,
            perPage: props.perPage,
            items: castMembersModel.map((castMemberModel) =>
                CastMemberMapper.toEntity(castMemberModel),
            ),
        });
    }

    async insert(castMember: CastMember): Promise<void> {
        const model = CastMemberMapper.toModel(castMember);

        await this.castMemberModel.create(model.toJSON());
    }

    async bulkInsert(categories: CastMember[]): Promise<void> {
        const categoriesModel = categories.map((category) =>
            CastMemberMapper.toModel(category).toJSON(),
        );

        await this.castMemberModel.bulkCreate(categoriesModel);
    }

    async update(castMember: CastMember): Promise<void> {
        const id = castMember.castMemberId.value;
        const castModelToUpdate = CastMemberMapper.toModel(castMember);

        const [effectedRows] = await this.castMemberModel.update(
            castModelToUpdate.toJSON(),
            {
                where: { castMemberId: id },
            },
        );

        if (effectedRows !== 1) {
            throw new CastMemberNotFoundError(id);
        }
    }

    async delete(castMemberId: CastMemberId): Promise<void> {
        const effectedRows = await this.castMemberModel.destroy({
            where: { castMemberId: castMemberId.value },
        });

        if (effectedRows !== 1) {
            throw new CastMemberNotFoundError(castMemberId.value);
        }
    }

    async findAll(): Promise<CastMember[]> {
        const castMembersModel = await CastMemberModel.findAll();

        return castMembersModel.map((model) =>
            CastMemberMapper.toEntity(model),
        );
    }

    async findById(castMemberId: CastMemberId): Promise<CastMember | null> {
        const castMemberModel = await this._get(castMemberId.value);

        return castMemberModel
            ? CastMemberMapper.toEntity(castMemberModel)
            : null;
    }

    getEntity(): new (...args: any[]) => CastMember {
        return CastMember;
    }

    private async _get(id: string) {
        return await CastMemberModel.findByPk(id);
    }

    private formatSort(sort: string, sortDir: SortDirection) {
        const dialect = this.castMemberModel.sequelize!.getDialect() as 'mysql';
        if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
            return this.orderBy[dialect][sort](sortDir);
        }
        return [[sort, sortDir]];
    }
}
