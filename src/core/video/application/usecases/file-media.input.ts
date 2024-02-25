import {
    IsInstance,
    IsInt,
    IsNotEmpty,
    IsString,
    validateSync,
} from 'class-validator';

type FileInputConstructorProps = {
    rawName: string;
    mimeType: string;
    size: number;
    data: Buffer;
};

export default class FileMediaInput {
    @IsNotEmpty()
    @IsString()
    rawName: string;

    @IsNotEmpty()
    @IsString()
    mimeType: string;

    @IsNotEmpty()
    @IsInt()
    size: number;

    @IsNotEmpty()
    @IsInstance(Buffer)
    data: Buffer;

    constructor(props?: FileInputConstructorProps) {
        if (!props) return;
        this.rawName = props.rawName;
        this.mimeType = props.mimeType;
        this.size = props.size;
        this.data = props.data;
    }
}

export class ValidateFileMediaInput {
    static validate(input: FileMediaInput) {
        return validateSync(input);
    }
}
