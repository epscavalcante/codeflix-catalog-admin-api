import { UpdateCastMemberInput } from '@core/cast-member/application/use-cases/mappers/update-cast-member-use-case.input';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateCastMemberDtoWithoutId extends OmitType(
    UpdateCastMemberInput,
    ['id'],
) {}

export class UpdateCastMemberDto extends UpdateCastMemberDtoWithoutId {}
