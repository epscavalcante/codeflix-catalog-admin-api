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
    // UseGuards,
} from '@nestjs/common';
import UpdateCastMemberUseCase from '@core/cast-member/application/use-cases/update-cast-member.use-case';
import DeleteCastMemberUseCase from '@core/cast-member/application/use-cases/delete-cast-member.use-case';
import CreateCastMemberUseCase from '@core/cast-member/application/use-cases/create-cast-member-use-case';
import FindCastMemberUseCase from '@core/cast-member/application/use-cases/find-cast-member.use-case';
import ListCastMemberUseCase from '@core/cast-member/application/use-cases/list-cast-member-use-case';
import {
    CastMemberCollectionPresenter,
    CastMemberPresenter,
} from './cast-members.presenter';
import SearchCastMemberDto from './dto/search-cast-member.dto';
import { CreateCastMemberDto } from './dto/create-cast-member.dto';
import { UpdateCastMemberInput } from '@core/cast-member/application/use-cases/mappers/update-cast-member-use-case.input';
import { UpdateCastMemberDto } from './dto/update-cast-member.dto';
// import AuthGuard from '../auth/auth.guard';
// import RoleGuard from '../auth/role.guard';

// @UseGuards(AuthGuard, RoleGuard)
@Controller('cast-members')
export class CastMembersController {
    @Inject(CreateCastMemberUseCase)
    private createCastMemberUseCase: CreateCastMemberUseCase;

    @Inject(FindCastMemberUseCase)
    private findCastMemberUseCase: FindCastMemberUseCase;

    @Inject(ListCastMemberUseCase)
    private listCastMemberUseCase: ListCastMemberUseCase;

    @Inject(UpdateCastMemberUseCase)
    private updateCastMemberUseCase: UpdateCastMemberUseCase;

    @Inject(DeleteCastMemberUseCase)
    private deleteCastMemberUseCase: DeleteCastMemberUseCase;

    constructor() {}

    @Post()
    async create(@Body() createCastMemberDto: CreateCastMemberDto) {
        const categoryCreatedOutput =
            await this.createCastMemberUseCase.handle(createCastMemberDto);

        return new CastMemberPresenter(categoryCreatedOutput);
    }

    @Get()
    async search(@Query() searchCastMemberDto: SearchCastMemberDto) {
        const castMembersSearchedOutput =
            await this.listCastMemberUseCase.handle(searchCastMemberDto);

        return new CastMemberCollectionPresenter(castMembersSearchedOutput);
    }

    @HttpCode(200)
    @Get(':id')
    async findOne(
        @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
        id: string,
    ) {
        const categoryFoundOutput = await this.findCastMemberUseCase.handle({
            id,
        });

        return new CastMemberPresenter(categoryFoundOutput);
    }

    @HttpCode(200)
    @Patch(':id')
    async update(
        @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
        id: string,
        @Body() updateCastMemberDto: UpdateCastMemberDto,
    ) {
        const castMemberUpateInput = new UpdateCastMemberInput({
            id,
            ...updateCastMemberDto,
        });
        const castMemberUpdateOutput =
            await this.updateCastMemberUseCase.handle(castMemberUpateInput);

        return new CastMemberPresenter(castMemberUpdateOutput);
    }

    @HttpCode(204)
    @Delete(':id')
    async remove(
        @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
        id: string,
    ) {
        return await this.deleteCastMemberUseCase.handle({ id });
    }
}
