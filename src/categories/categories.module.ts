import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import CategoryModel from '../core/infra/models/sequelize/category.model';
import { CATEGORY_PROVIDERS } from './categories.provider';

@Module({
    imports: [SequelizeModule.forFeature([CategoryModel])],
    controllers: [CategoriesController],
    providers: [
        ...Object.values(CATEGORY_PROVIDERS.REPOSITORIES),
        ...Object.values(CATEGORY_PROVIDERS.USE_CASES),
    ],
})
export class CategoriesModule {}
