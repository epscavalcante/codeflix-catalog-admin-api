import { IsIn, IsNotEmpty, IsString, validateSync } from 'class-validator';
import { AudioVideoMediaRelatedField } from '@core/video/infra/database/sequelize/models/video-audio-media.model';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';

export type ProcessAudioVideoInputConstructorProps = {
    videoId: string;
    field: AudioVideoMediaRelatedField;
    status: AudioVideoMediaStatus;
    encodedLocation: string;
};

export default class ProcessAudioVideoInput {
    @IsString()
    @IsNotEmpty()
    videoId: string;

    @IsString()
    @IsNotEmpty()
    encodedLocation: string;

    @IsIn(
        Object.keys(AudioVideoMediaRelatedField).map(
            (key) => AudioVideoMediaRelatedField[key],
        ),
    )
    @IsNotEmpty()
    field: AudioVideoMediaRelatedField;

    @IsIn(
        Object.keys(AudioVideoMediaStatus)
            .filter((i) => i !== AudioVideoMediaStatus.PENDING)
            .map((key) => AudioVideoMediaStatus[key]),
    )
    @IsNotEmpty()
    status: AudioVideoMediaStatus;

    constructor(props?: ProcessAudioVideoInputConstructorProps) {
        if (!props) return;
        this.videoId = props.videoId;
        this.field = props.field;
        this.status = props.status;
        this.encodedLocation = props.encodedLocation;
    }
}

export class ValidateVideoProcessAudioVideoInput {
    static validate(input: ProcessAudioVideoInput) {
        return validateSync(input);
    }
}
