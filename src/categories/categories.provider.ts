import { getModelToken } from '@nestjs/sequelize';
import CategoryModel from '../core/infra/models/sequelize/category.model';
import CategorySequelizeRepository from '../core/infra/repositories/category-sequelize.repository';
import CategoryMemoryRepository from '../core/infra/repositories/category-memory.repository';
import CreateCategoryUseCase from '../core/application/use-cases/category/create-category.use-case';
import ICategoryRepository from '../core/domain/repositories/category.repository';
import ListCategoryUseCase from '../core/application/use-cases/category/list-category.use-case';
import UpdateCategoryUseCase from '../core/application/use-cases/category/update-category.use-case';
import FindCategoryUseCase from '../core/application/use-cases/category/find-category.use-case';
import DeleteCategoryUseCase from '../core/application/use-cases/category/delete-category.use-case';

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

export const CATEGORY_PROVIDERS = {
    REPOSITORIES,
    USE_CASES,
};
