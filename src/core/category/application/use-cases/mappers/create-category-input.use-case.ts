import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    validateSync,
} from 'class-validator';

export type CreateCategoryInputProps = {
    name: string;
    description?: string;
    isActive?: boolean;
};

export class CreateCategoryInput {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    constructor(props: CreateCategoryInputProps) {
        if (!props) return;

        this.name = props.name;
        this.description = props.description;
        this.isActive = props.isActive;
    }
}

export class ValidateCreateCategoryInput {
    static validate(input: CreateCategoryInput) {
        return validateSync(input);
    }
}
