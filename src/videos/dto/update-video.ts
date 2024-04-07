import UpdateVideoInput from '@core/video/application/usecases/update/update-video.usecase.input';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateVideoInputWithoutId extends OmitType(UpdateVideoInput, [
    'id',
] as any) {}

export default class UpdateVideoDto extends UpdateVideoInputWithoutId {}
