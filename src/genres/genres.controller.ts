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
} from '@nestjs/common';
import CreateGenreUseCase from '@core/genre/application/use-cases/create-genre.use-case';
import FindGenreUseCase from '@core/genre/application/use-cases/find-genre.use-case';
import ListGenreUseCase from '@core/genre/application/use-cases/list-genre.use-case';
import UpdateGenreUseCase from '@core/genre/application/use-cases/update-genre.use-case';
import DeleteGenreUseCase from '@core/genre/application/use-cases/delete-genre.use-case';
import { CreateGenreDto } from './dto/create-genre.dto';
import { GenreCollectionPresenter, GenrePresenter } from './genre.presenter';
import { SearchGenreDto } from './dto/search-genre.dto';
import { UpdateGenreDto } from './dto/update-genre';

@Controller('genres')
export class GenresController {
    @Inject(CreateGenreUseCase)
    private createGenreUseCase: CreateGenreUseCase;

    @Inject(FindGenreUseCase)
    private findGenreUseCase: FindGenreUseCase;

    @Inject(ListGenreUseCase)
    private listGenreUseCase: ListGenreUseCase;

    @Inject(UpdateGenreUseCase)
    private updateGenreUseCase: UpdateGenreUseCase;

    @Inject(DeleteGenreUseCase)
    private deleteGenreUseCase: DeleteGenreUseCase;

    constructor() {}

    @Post()
    async create(@Body() createGenreDto: CreateGenreDto) {
        const genreCreatedOutput =
            await this.createGenreUseCase.handle(createGenreDto);

        return new GenrePresenter(genreCreatedOutput);
    }

    @Get()
    async search(@Query() searchGenreDto: SearchGenreDto) {
        const genresSearchedOutput =
            await this.listGenreUseCase.handle(searchGenreDto);

        return new GenreCollectionPresenter(genresSearchedOutput);
    }

    @HttpCode(200)
    @Get(':id')
    async findOne(
        @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
        id: string,
    ) {
        const genreFoundOutput = await this.findGenreUseCase.handle({
            id,
        });

        return new GenrePresenter(genreFoundOutput);
    }

    @HttpCode(200)
    @Patch(':id')
    async update(
        @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
        id: string,
        @Body() updateGenreDto: UpdateGenreDto,
    ) {
        const genreUpdatedOutput = await this.updateGenreUseCase.handle({
            ...updateGenreDto,
            id,
        });

        return new GenrePresenter(genreUpdatedOutput);
    }

    @HttpCode(204)
    @Delete(':id')
    async remove(
        @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
        id: string,
    ) {
        return await this.deleteGenreUseCase.handle({ id });
    }
}
