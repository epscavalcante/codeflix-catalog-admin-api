import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    validateSync,
} from "class-validator";

type UpdateCategoryInputProps = {
    id: string;
    name: string;
    description?: string | null;
    isActive?: boolean;
};

export class UpdateCategoryInput {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string | null;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    constructor(props: UpdateCategoryInputProps) {
        if (!props) return;

        this.id = props.id;
        props.name && (this.name = props.name);
        props.description && (this.description = props.description);
        props.isActive !== props.isActive &&
            props.isActive !== undefined &&
            (this.isActive = props.isActive);
    }
}

export class ValidateUpdateCategoryInput {
    static validate(input: UpdateCategoryInput) {
        return validateSync(input);
    }
}
