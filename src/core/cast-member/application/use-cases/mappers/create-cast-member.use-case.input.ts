import { CastMemberTypeEnum } from '@core/cast-member/domain/cast-member-type.value-object';
import { IsInt, IsNotEmpty, IsString, validateSync } from 'class-validator';

export type CreateCastMemberInputConstructorProps = {
    name: string;
    type: CastMemberTypeEnum;
};

export class CreateCastMemberInput {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @IsNotEmpty()
    type: CastMemberTypeEnum;

    constructor(props?: CreateCastMemberInputConstructorProps) {
        if (!props) return;
        this.name = props.name;
        this.type = props.type;
    }
}

export class ValidateCreateCastMemberInput {
    static validate(input: CreateCastMemberInput) {
        return validateSync(input);
    }
}
