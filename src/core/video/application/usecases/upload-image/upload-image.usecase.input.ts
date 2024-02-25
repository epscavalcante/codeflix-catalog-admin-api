import { ImageMediaRelatedField } from '@core/video/infra/database/sequelize/models/video-image-media.model';
import {
    IsIn,
    IsNotEmpty,
    IsString,
    ValidateNested,
    validateSync,
} from 'class-validator';
import FileMediaInput from '../file-media.input';

export type UploadImageInputConstructorProps = {
    videoId: string;
    videoField: ImageMediaRelatedField;
    file: FileMediaInput;
};

export default class UploadImageInput {
    @IsString()
    @IsNotEmpty()
    videoId: string;

    @IsIn(
        Object.keys(ImageMediaRelatedField).map(
            (key) => ImageMediaRelatedField[key],
        ),
    )
    @IsNotEmpty()
    videoField: ImageMediaRelatedField;

    @ValidateNested()
    file: FileMediaInput;

    constructor(props?: UploadImageInputConstructorProps) {
        if (!props) return;
        this.videoId = props.videoId;
        this.videoField = props.videoField;
        this.file = props.file;
    }
}

export class ValidateVideoUploadImageInput {
    static validate(input: UploadImageInput) {
        return validateSync(input);
    }
}
