import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { CategoriesModule } from './categories.module';
import { CategoriesController } from './categories.controller';
import ICategoryRepository from '../core/domain/repositories/category.repository';
import { CATEGORY_PROVIDERS } from './categories.provider';
import CreateCategoryUseCase from '../core/application/use-cases/category/create-category.use-case';
import DeleteCategoryUseCase from '../core/application/use-cases/category/delete-category.use-case';
import UpdateCategoryUseCase from '../core/application/use-cases/category/update-category.use-case';
import FindCategoryUseCase from '../core/application/use-cases/category/find-category.use-case';
import ListCategoryUseCase from '../core/application/use-cases/category/list-category.use-case';

describe('CategoriesController Integration tests', () => {
    let controller: CategoriesController;
    let repository: ICategoryRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
        }).compile();
        controller = module.get<CategoriesController>(CategoriesController);
        repository = module.get<ICategoryRepository>(
            CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
    });

    test('Deve instanciar corretamente os componentes', () => {
        expect(controller).toBeDefined();
        expect(controller['createCategoryUseCase']).toBeInstanceOf(
            CreateCategoryUseCase,
        );
        expect(controller['listCategoryUseCase']).toBeInstanceOf(
            ListCategoryUseCase,
        );
        expect(controller['findCategoryUseCase']).toBeInstanceOf(
            FindCategoryUseCase,
        );
        expect(controller['updateCategoryUseCase']).toBeInstanceOf(
            UpdateCategoryUseCase,
        );
        expect(controller['deleteCategoryUseCase']).toBeInstanceOf(
            DeleteCategoryUseCase,
        );
    });
});
