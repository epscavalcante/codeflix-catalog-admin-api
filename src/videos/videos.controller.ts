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
    UploadedFiles,
    UseInterceptors,
    BadRequestException,
    ValidationPipe,
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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AudioVideoMediaRelatedField } from '@core/video/infra/database/sequelize/models/video-audio-media.model';
import UploadAudioVideoUseCase from '@core/video/application/usecases/upload-audio-video/upload-audio-video.usecase';
import UploadImageUseCase from '@core/video/application/usecases/upload-image/upload-image.usecase';
import { ImageMediaRelatedField } from '@core/video/infra/database/sequelize/models/video-image-media.model';
import UploadImageVideoMediaDto from './dto/upload-image-video-media.dto';
import UploadAudioVideoDto from './dto/upload-audio-video-media.dto';

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

    @Inject(UploadImageUseCase)
    private uploadImageUseCase: UploadImageUseCase;

    @Inject(UploadAudioVideoUseCase)
    private uploadAudioVideoUseCase: UploadAudioVideoUseCase;

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

    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'banner', maxCount: 1 },
            { name: 'video', maxCount: 1 },
            { name: 'trailer', maxCount: 1 },
            { name: 'thumbnail', maxCount: 1 },
            { name: 'thumbnailHalf', maxCount: 1 },
        ]),
    )
    @HttpCode(200)
    @Post(':id/uploads')
    async uploads(
        @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 }))
        id: string,
        @UploadedFiles()
        files: {
            banner?: Express.Multer.File[];
            thumbnail?: Express.Multer.File[];
            thumbnailHalf?: Express.Multer.File[];
            trailer?: Express.Multer.File[];
            video?: Express.Multer.File[];
        },
    ) {
        const hasMultipleFiles = Object.keys(files).length > 1;
        if (hasMultipleFiles)
            throw new BadRequestException('Apenas um arquivo por vez');

        const doestHaveFile = Object.keys(files).length === 0;
        if (doestHaveFile) throw new BadRequestException('Envie 1 arquivo');

        const field = Object.keys(files)[0];
        const file = files[field][0];

        const isAudioVideoMedia = [
            AudioVideoMediaRelatedField.TRAILER,
            AudioVideoMediaRelatedField.VIDEO,
        ].includes(file.fieldname);
        if (isAudioVideoMedia) {
            const uploadAudioVideoDto: UploadAudioVideoDto = {
                videoId: id,
                videoField: field as AudioVideoMediaRelatedField,
                file: {
                    size: file.size,
                    mimeType: file.mimetype,
                    rawName: file.originalname,
                    data: file.buffer,
                },
            };

            const input = await new ValidationPipe({
                errorHttpStatusCode: 422,
            }).transform(uploadAudioVideoDto, {
                metatype: UploadAudioVideoDto,
                type: 'body',
            });

            await this.uploadAudioVideoUseCase.handle(input);
        }

        const isImageMedia = [
            ImageMediaRelatedField.BANNER,
            ImageMediaRelatedField.THUMBNAIL,
            ImageMediaRelatedField.THUMBNAIL_HALF,
        ].includes(file.fieldname);
        if (isImageMedia) {
            const uploadImageVideoMediaDto: UploadImageVideoMediaDto = {
                videoId: id,
                videoField: field as ImageMediaRelatedField,
                file: {
                    size: file.size,
                    mimeType: file.mimetype,
                    rawName: file.originalname,
                    data: file.buffer,
                },
            };

            const input = await new ValidationPipe({
                errorHttpStatusCode: 422,
            }).transform(uploadImageVideoMediaDto, {
                metatype: UploadImageVideoMediaDto,
                type: 'body',
            });

            await this.uploadImageUseCase.handle(input);
        }

        return await this.findVideoUseCase.handle({ id });
    }
}
