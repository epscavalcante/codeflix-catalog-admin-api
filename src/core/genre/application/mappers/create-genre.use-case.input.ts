import {
    IsArray,
    IsNotEmpty,
    IsString,
    IsUUID,
    validateSync,
} from 'class-validator';

export type CreateGenreInputConstructorProps = {
    name: string;
    categoriesId: string[];
};

export class CreateGenreInput {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsUUID('4', { each: true })
    @IsArray()
    @IsNotEmpty()
    categoriesId: string[];

    constructor(props?: CreateGenreInputConstructorProps) {
        if (!props) return;
        this.name = props.name;
        this.categoriesId = props.categoriesId;
    }
}

export class ValidateCreateGenreInput {
    static validate(input: CreateGenreInput) {
        return validateSync(input);
    }
}
