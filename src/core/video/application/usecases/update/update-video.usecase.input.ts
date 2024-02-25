import { RatingClassifications } from '@core/video/domain/video-rating.vo';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    validateSync,
} from 'class-validator';

export default class UpdateVideoInput {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(1900)
    yearLaunched?: number;

    @IsInt()
    @IsOptional()
    @Min(1)
    duration?: number;

    @IsBoolean()
    @IsOptional()
    isOpened?: boolean;

    @IsString()
    @IsOptional()
    rating?: RatingClassifications;

    @IsArray()
    @IsOptional()
    @IsUUID('4', { each: true })
    genresId?: string[];

    @IsArray()
    @IsOptional()
    @IsUUID('4', { each: true })
    categoriesId?: string[];

    @IsArray()
    @IsOptional()
    @IsUUID('4', { each: true })
    castMembersId?: string[];

    constructor(props?: UpdateVideoInputConstructorProps) {
        if (!props) return;
        this.id = props.id;
        this.title = props?.title;
        this.description = props?.description;
        this.yearLaunched = props?.yearLaunched;
        this.duration = props?.duration;
        this.isOpened = props.isOpened;
        this.rating = props?.rating;
        this.genresId = props?.genresId;
        this.categoriesId = props?.categoriesId;
        this.castMembersId = props?.castMembersId;
    }
}

export class ValidateCreateVideoInput {
    static validate(input: UpdateVideoInput) {
        return validateSync(input);
    }
}

export type UpdateVideoInputConstructorProps = {
    id: string;
    title?: string;
    description?: string;
    yearLaunched?: number;
    duration?: number;
    isOpened?: boolean;
    rating?: RatingClassifications;
    categoriesId?: string[];
    genresId?: string[];
    castMembersId?: string[];
};
