import { getModelToken } from '@nestjs/sequelize';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';
import CategorySequelizeRepository from '../core/category/infra/repositories/category-sequelize.repository';
import CategoryMemoryRepository from '../core/category/infra/repositories/category-memory.repository';
import CreateCategoryUseCase from '@core/category/application/use-cases/create-category.use-case';
import ICategoryRepository from '@core/category/domain/category.repository.interface';
import ListCategoryUseCase from '@core/category/application/use-cases/list-category.use-case';
import UpdateCategoryUseCase from '@core/category/application/use-cases/update-category.use-case';
import FindCategoryUseCase from '@core/category/application/use-cases/find-category.use-case';
import DeleteCategoryUseCase from '@core/category/application/use-cases/delete-category.use-case';
import CategoriesIdsExistsInDatabaseValidation from '@core/category/application/validations/categories-ids-exists-in-database.validation';

export const REPOSITORIES = {
    CATEGORY_REPOSITORY: {
        provide: 'CategoryRepository',
        useExisting: CategorySequelizeRepository,
    },

    CATEGORY_MEMORY_REPOSITORY: {
        provide: CategoryMemoryRepository,
        useClass: CategoryMemoryRepository,
    },

    CATEGORY_DATABASE_REPOSITORY: {
        provide: CategorySequelizeRepository,
        useFactory: (catagoryModel: typeof CategoryModel) =>
            new CategorySequelizeRepository(catagoryModel),
        inject: [getModelToken(CategoryModel)],
    },
};

export const USE_CASES = {
    CREATE_CATEGORY_USE_CASE: {
        provide: CreateCategoryUseCase,
        useFactory: (categoryRepository: ICategoryRepository) =>
            new CreateCategoryUseCase(categoryRepository),
        inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
    },

    FIND_CATEGORY_USE_CASE: {
        provide: FindCategoryUseCase,
        useFactory: (categoryRepository: ICategoryRepository) =>
            new FindCategoryUseCase(categoryRepository),
        inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
    },

    LIST_CATEGORY_USE_CASE: {
        provide: ListCategoryUseCase,
        useFactory: (categoryRepository: ICategoryRepository) =>
            new ListCategoryUseCase(categoryRepository),
        inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
    },

    UPDATE_CATEGORY_USE_CASE: {
        provide: UpdateCategoryUseCase,
        useFactory: (categoryRepository: ICategoryRepository) =>
            new UpdateCategoryUseCase(categoryRepository),
        inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
    },

    DELETE_CATEGORY_USE_CASE: {
        provide: DeleteCategoryUseCase,
        useFactory: (categoryRepository: ICategoryRepository) =>
            new DeleteCategoryUseCase(categoryRepository),
        inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
    },
};

export const VALIDATIONS = {
    CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR: {
        provide: CategoriesIdsExistsInDatabaseValidation,
        useFactory: (categoryRepo: ICategoryRepository) => {
            return new CategoriesIdsExistsInDatabaseValidation(categoryRepo);
        },
        inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
    },
};

export const CATEGORY_PROVIDERS = {
    REPOSITORIES,
    USE_CASES,
    VALIDATIONS,
};
