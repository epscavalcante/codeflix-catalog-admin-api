import Uuid from "../../domain/value-objects/uuid.vo";
import ICategoryRepository, { CategorySearchParams, CategorySearchResult } from "../../domain/repositories/category.repository.interface";
import CategoryModel from "../models/sequelize/category.model";
import EntityNotFoundException from "../../domain/exceptions/entity-not-found.exception";
import Category from "../../domain/entities/category.entity";
import { Op } from "sequelize";
import CategoryMapper from "../mappers/category.mapper";

export default class CategorySequelizeRepository implements ICategoryRepository {
    sortableFields: string[] = ['name', 'createdAt'];

    constructor(private categoryModel: typeof CategoryModel) {}

    async insert(category: Category): Promise<void> {
        const model = CategoryMapper.toModel(category);

        await this.categoryModel.create(model.toJSON());
    }
    
    async bulkInsert(categories: Category[]): Promise<void> {
        const categoriesModel = categories.map(category => CategoryMapper.toModel(category).toJSON());
        
        await this.categoryModel.bulkCreate(categoriesModel);
    }
    
    async update(category: Category): Promise<void> {
        const id = category.categoryId.value;
        const categoryModel = await this._get(id);

        if (!categoryModel) {
            throw new EntityNotFoundException(id, this.getEntity());
        }

        const categoriesModelToUpdate = CategoryMapper.toModel(category)

        this.categoryModel.update(
            categoriesModelToUpdate.toJSON(),
            { where: { categoryId: id } }
        )
    }
    
    async delete(categoryId: Uuid): Promise<void> {
        const categoryModel = await this._get(categoryId.value);

        if (!categoryModel) {
            throw new EntityNotFoundException(categoryId.value, this.getEntity());
        }

        this.categoryModel.destroy({ where: { categoryId: categoryId.value } });
    }
    
    async findAll(): Promise<Category[]> {
        const categoriesModel = await CategoryModel.findAll();

        return categoriesModel.map(categoryModel => CategoryMapper.toEntity(categoryModel));
    }
    
    async findById(categoryId: Uuid): Promise<Category | null> {
        const categoryModel = await this._get(categoryId.value)
        
        return categoryModel ? CategoryMapper.toEntity(categoryModel) : null;
    }

    async search(props: CategorySearchParams): Promise<CategorySearchResult> {
        const offset = (props.page - 1) * props.perPage;
        const limit = props.perPage;

        const {rows: categoriesModel, count: total } = await this.categoryModel.findAndCountAll({
            ...(props.filter && {
                where: {
                    name: {[Op.like]: `%${props.filter}%`}
                }
            }),
            ...(props.sort && this.sortableFields.includes(props.sort)
                ? { order: [[props.sort, props.sortDir]] }
                : { order: [['created_at', 'desc']] }
            ),
            offset,
            limit
        });

        return new CategorySearchResult({
            total,
            currentPage: props.page,
            perPage: props.perPage,
            items: categoriesModel.map(categoryModel => CategoryMapper.toEntity(categoryModel))
        })

    }

    getEntity(): new (...args: any[]) => Category {
        return Category;
    }

    private async _get(id: string) {
        return await CategoryModel.findByPk(id);
    }
}