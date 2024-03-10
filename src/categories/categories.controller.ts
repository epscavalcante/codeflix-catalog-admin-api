import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Inject,
    ParseUUIDPipe,
    HttpCode,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import SearchCategoryDto from './dto/search-category.dto';
import {
    CategoryCollectionPresenter,
    CategoryPresenter,
} from './categories.presenter';
import CreateCategoryUseCase from '@core/category/application/use-cases/create-category.use-case';
import FindCategoryUseCase from '@core/category/application/use-cases/find-category.use-case';
import ListCategoryUseCase from '@core/category/application/use-cases/list-category.use-case';
import UpdateCategoryUseCase from '@core/category/application/use-cases/update-category.use-case';
import DeleteCategoryUseCase from '@core/category/application/use-cases/delete-category.use-case';
// import AuthGuard from '../auth/auth.guard';
// import RoleGuard from '../auth/role.guard';

// @UseGuards(AuthGuard, RoleGuard)
@Controller('categories')
export class CategoriesController {
    @Inject(CreateCategoryUseCase)
    private createCategoryUseCase: CreateCategoryUseCase;

    @Inject(FindCategoryUseCase)
    private findCategoryUseCase: FindCategoryUseCase;

    @Inject(ListCategoryUseCase)
    private listCategoryUseCase: ListCategoryUseCase;

    @Inject(UpdateCategoryUseCase)
    private updateCategoryUseCase: UpdateCategoryUseCase;

    @Inject(DeleteCategoryUseCase)
    private deleteCategoryUseCase: DeleteCategoryUseCase;

    constructor() {}

    @Post()
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        const categoryCreatedOutput =
            await this.createCategoryUseCase.handle(createCategoryDto);

        return new CategoryPresenter(categoryCreatedOutput);
    }

    @Get()
    async search(@Query() searchCategoryDto: SearchCategoryDto) {
        const categoriesSearchedOutput =
            await this.listCategoryUseCase.handle(searchCategoryDto);

        return new CategoryCollectionPresenter(categoriesSearchedOutput);
    }

    @HttpCode(200)
    @Get(':id')
    async findOne(
        @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
        id: string,
    ) {
        const categoryFoundOutput = await this.findCategoryUseCase.handle({
            id,
        });

        return new CategoryPresenter(categoryFoundOutput);
    }

    @HttpCode(200)
    @Patch(':id')
    async update(
        @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
        id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        const categoryUpdatedOutput = await this.updateCategoryUseCase.handle({
            ...updateCategoryDto,
            id,
        });

        return new CategoryPresenter(categoryUpdatedOutput);
    }

    @HttpCode(204)
    @Delete(':id')
    async remove(
        @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
        id: string,
    ) {
        return await this.deleteCategoryUseCase.handle({ id });
    }
}
