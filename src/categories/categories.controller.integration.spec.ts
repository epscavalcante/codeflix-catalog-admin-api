import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { CategoriesModule } from './categories.module';
import { CategoriesController } from './categories.controller';
import CreateCategoryUseCase from '@core/category/application/use-cases/create-category.use-case';
import ListCategoryUseCase from '@core/category/application/use-cases/list-category.use-case';
import FindCategoryUseCase from '@core/category/application/use-cases/find-category.use-case';
import UpdateCategoryUseCase from '@core/category/application/use-cases/update-category.use-case';
import DeleteCategoryUseCase from '@core/category/application/use-cases/delete-category.use-case';
import { AuthModule } from '../auth/auth.module';

describe('CategoriesController Integration tests', () => {
    let controller: CategoriesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot(),
                DatabaseModule,
                AuthModule,
                CategoriesModule,
            ],
        }).compile();
        controller = module.get<CategoriesController>(CategoriesController);
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
