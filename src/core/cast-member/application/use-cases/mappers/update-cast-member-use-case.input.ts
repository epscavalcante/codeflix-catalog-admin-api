import { CastMemberTypeEnum } from '@core/cast-member/domain/cast-member-type.value-object';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    validateSync,
} from 'class-validator';

type UpdateCastMemberInputProps = {
    id: string;
    name: string;
    type: number;
};

export class UpdateCastMemberInput {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @IsOptional()
    type: CastMemberTypeEnum;

    constructor(props: UpdateCastMemberInputProps) {
        if (!props) return;

        this.id = props.id;
        props.name && (this.name = props.name);
        props.type && (this.type = props.type);
    }
}

export class ValidateUpdateCastMemberInput {
    static validate(input: UpdateCastMemberInput) {
        return validateSync(input);
    }
}
