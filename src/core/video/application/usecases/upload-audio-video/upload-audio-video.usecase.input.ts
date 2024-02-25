import {
    IsIn,
    IsNotEmpty,
    IsString,
    ValidateNested,
    validateSync,
} from 'class-validator';
import FileMediaInput from '../file-media.input';
import { AudioVideoMediaRelatedField } from '@core/video/infra/database/sequelize/models/video-audio-media.model';

export type UploadAudioVideoInputConstructorProps = {
    videoId: string;
    videoField: AudioVideoMediaRelatedField;
    file: FileMediaInput;
};

export default class UploadAudioVideoInput {
    @IsString()
    @IsNotEmpty()
    videoId: string;

    @IsIn(
        Object.keys(AudioVideoMediaRelatedField).map(
            (key) => AudioVideoMediaRelatedField[key],
        ),
    )
    @IsNotEmpty()
    videoField: AudioVideoMediaRelatedField;

    @ValidateNested()
    file: FileMediaInput;

    constructor(props?: UploadAudioVideoInputConstructorProps) {
        if (!props) return;
        this.videoId = props.videoId;
        this.videoField = props.videoField;
        this.file = props.file;
    }
}

export class ValidateVideoUploadAudioVideoInput {
    static validate(input: UploadAudioVideoInput) {
        return validateSync(input);
    }
}
