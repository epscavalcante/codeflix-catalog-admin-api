import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    validateSync,
} from 'class-validator';

export type UpdateGenreInputConstructorProps = {
    name?: string;
    categoriesId?: string[];
};

export class UpdateGenreInput {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsUUID('4', { each: true })
    @IsArray()
    @IsOptional()
    categoriesId?: string[];

    constructor(props?: UpdateGenreInputConstructorProps) {
        if (!props) return;
        if (props.name) this.name = props.name;
        if (props.categoriesId?.length) this.categoriesId = props.categoriesId;
    }
}

export class ValidateUpdateGenreInput {
    static validate(input: UpdateGenreInput) {
        return validateSync(input);
    }
}
