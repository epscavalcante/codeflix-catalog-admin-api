import { RatingClassifications } from '@core/video/domain/video-rating.vo';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsString,
    IsUUID,
    Min,
    validateSync,
} from 'class-validator';

export default class CreateVideoInput {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    @IsInt()
    @Min(1900)
    yearLaunched: number;

    @IsInt()
    @IsNotEmpty()
    @Min(1)
    duration: number;

    @IsBoolean()
    @IsNotEmpty()
    isOpened: boolean;

    @IsString()
    @IsNotEmpty()
    rating: RatingClassifications;

    @IsArray()
    @IsNotEmpty()
    @IsUUID('4', { each: true })
    genresId: string[];

    @IsArray()
    @IsNotEmpty()
    @IsUUID('4', { each: true })
    categoriesId: string[];

    @IsArray()
    @IsNotEmpty()
    @IsUUID('4', { each: true })
    castMembersId: string[];

    constructor(props?: CreateVideoInputConstructorProps) {
        if (!props) return;
        this.title = props.title;
        this.description = props.description;
        this.yearLaunched = props.yearLaunched;
        this.duration = props.duration;
        this.isOpened = props.isOpened;
        this.rating = props.rating;
        this.genresId = props.genresId;
        this.categoriesId = props.categoriesId;
        this.castMembersId = props.castMembersId;
    }
}

export class ValidateCreateVideoInput {
    static validate(input: CreateVideoInput) {
        return validateSync(input);
    }
}

export type CreateVideoInputConstructorProps = {
    title: string;
    description: string;
    yearLaunched: number;
    duration: number;
    isOpened: boolean;
    rating: RatingClassifications;
    categoriesId: string[];
    genresId: string[];
    castMembersId: string[];
};
