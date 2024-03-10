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
import CreateVideoUseCase from '@core/video/application/usecases/create/create-video.usecase';
import FindVideoUseCase from '@core/video/application/usecases/find/find-video.usecase';
import UpdateVideoUseCase from '@core/video/application/usecases/update/update-video.usecase';
import DeleteVideoUseCase from '@core/video/application/usecases/delete/delete-video.usecase';
import CreateVideoDto from './dto/create-video.dto';
import VideoPresenter, { VideoCollectionPresenter } from './videos.presenter';
import UpdateVideoDto from './dto/update-video';
import ListVideoUseCase from '@core/video/application/usecases/list/list-video.use-case';
import SearchVideoDto from './dto/search-video.dto';

@Controller('videos')
export default class VideosController {
    @Inject(CreateVideoUseCase)
    private createVideoUseCase: CreateVideoUseCase;

    @Inject(FindVideoUseCase)
    private findVideoUseCase: FindVideoUseCase;

    @Inject(ListVideoUseCase)
    private listVideoUseCase: ListVideoUseCase;

    @Inject(UpdateVideoUseCase)
    private updateVideoUseCase: UpdateVideoUseCase;

    @Inject(DeleteVideoUseCase)
    private deleteVideoUseCase: DeleteVideoUseCase;

    // @Inject(UploadImageUseCase)
    // private uploadImageUseCase: UploadImageUseCase;

    // @Inject(UploadAudioVideoUseCase)
    // private uploadAudioVideoUseCase: UploadAudioVideoUseCase;

    // @Inject(ProcessAudioVideoUseCase)
    // private processAudioVideoUseCase: ProcessAudioVideoUseCase;

    constructor() {}

    @Post()
    @HttpCode(201)
    async create(@Body() createVideoDto: CreateVideoDto) {
        const videoCreatedOutput =
            await this.createVideoUseCase.handle(createVideoDto);

        return {
            id: videoCreatedOutput.id,
        };
    }

    @Get()
    async search(@Query() searchVideoDto: SearchVideoDto) {
        const videosSearchedOutput =
            await this.listVideoUseCase.handle(searchVideoDto);

        return new VideoCollectionPresenter(videosSearchedOutput);
    }

    @HttpCode(200)
    @Get(':id')
    async findOne(
        @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
        id: string,
    ) {
        const videoFoundOutput = await this.findVideoUseCase.handle({
            id,
        });

        return new VideoPresenter(videoFoundOutput);
    }

    @HttpCode(200)
    @Patch(':id')
    async update(
        @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
        id: string,
        @Body() updateVideoDto: UpdateVideoDto,
    ) {
        const videoUpdatedOutput = await this.updateVideoUseCase.handle({
            ...updateVideoDto,
            id,
        });

        return {
            id: videoUpdatedOutput.id,
        };
    }

    @HttpCode(204)
    @Delete(':id')
    async remove(
        @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
        id: string,
    ) {
        return await this.deleteVideoUseCase.handle({ id });
    }
}
