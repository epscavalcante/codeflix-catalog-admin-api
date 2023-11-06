import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CATEGORY_PROVIDERS } from './categories.provider';
import CategoryModel from '@core/category/infra/database/sequelize/models/category.model';

@Module({
    imports: [SequelizeModule.forFeature([CategoryModel])],
    controllers: [CategoriesController],
    providers: [
        ...Object.values(CATEGORY_PROVIDERS.REPOSITORIES),
        ...Object.values(CATEGORY_PROVIDERS.USE_CASES),
    ],
})
export class CategoriesModule {}