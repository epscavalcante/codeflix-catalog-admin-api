import ICategoryRepository, {
    CategorySearchParams,
    CategorySearchResult,
} from '@core/category/domain/category.repository.interface';
import CategoryModel from '../database/sequelize/models/category.model';
import EntityNotFoundException from '@core/shared/domain/exceptions/entity-not-found.exception';
import Category, { CategoryId } from '@core/category/domain/category.aggregate';
import { Op, literal } from 'sequelize';
import CategoryMapper from '@core/category/infra/database/sequelize/mappers/category.mapper';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';

export default class CategorySequelizeRepository
    implements ICategoryRepository
{
    sortableFields: string[] = ['name', 'createdAt'];
    orderBy = {
        mysql: {
            name: (sortDirection: SortDirection) =>
                literal(`binary name ${sortDirection}`),
        },
    };

    constructor(private categoryModel: typeof CategoryModel) {}

    async insert(category: Category): Promise<void> {
        const model = CategoryMapper.toModel(category);

        await this.categoryModel.create(model.toJSON());
    }

    async bulkInsert(categories: Category[]): Promise<void> {
        const categoriesModel = categories.map((category) =>
            CategoryMapper.toModel(category).toJSON(),
        );

        await this.categoryModel.bulkCreate(categoriesModel);
    }

    async update(category: Category): Promise<void> {
        const id = category.categoryId.value;
        const categoryModel = await this._get(id);

        if (!categoryModel) {
            throw new EntityNotFoundException(id, this.getEntity());
        }

        const categoriesModelToUpdate = CategoryMapper.toModel(category);

        this.categoryModel.update(categoriesModelToUpdate.toJSON(), {
            where: { categoryId: id },
        });
    }

    async delete(categoryId: CategoryId): Promise<void> {
        const categoryModel = await this._get(categoryId.value);

        if (!categoryModel) {
            throw new EntityNotFoundException(
                categoryId.value,
                this.getEntity(),
            );
        }

        this.categoryModel.destroy({ where: { categoryId: categoryId.value } });
    }

    async findAll(): Promise<Category[]> {
        const categoriesModel = await CategoryModel.findAll();

        return categoriesModel.map((categoryModel) =>
            CategoryMapper.toEntity(categoryModel),
        );
    }

    async findById(categoryId: CategoryId): Promise<Category | null> {
        const categoryModel = await this._get(categoryId.value);

        return categoryModel ? CategoryMapper.toEntity(categoryModel) : null;
    }

    async search(props: CategorySearchParams): Promise<CategorySearchResult> {
        const offset = (props.page - 1) * props.perPage;
        const limit = props.perPage;

        const { rows: categoriesModel, count: total } =
            await this.categoryModel.findAndCountAll({
                ...(props.filter && {
                    where: {
                        name: { [Op.like]: `%${props.filter}%` },
                    },
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

        return new CategorySearchResult({
            total,
            currentPage: props.page,
            perPage: props.perPage,
            items: categoriesModel.map((categoryModel) =>
                CategoryMapper.toEntity(categoryModel),
            ),
        });
    }

    getEntity(): new (...args: any[]) => Category {
        return Category;
    }

    private async _get(id: string) {
        return await CategoryModel.findByPk(id);
    }

    private formatSort(sort: string, sortDir: SortDirection) {
        const dialect = this.categoryModel.sequelize!.getDialect() as 'mysql';
        if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
            return this.orderBy[dialect][sort](sortDir);
        }
        return [[sort, sortDir]];
    }
}
