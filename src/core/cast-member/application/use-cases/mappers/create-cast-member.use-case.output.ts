import CastMember from '@core/cast-member/domain/cast-member.aggregate';

export type CastMemberOutputType = {
    id: string;
    name: string;
    type: number;
    createdAt: Date;
};

export class CastMemberOutput {
    static toOutput(entity: CastMember): CastMemberOutputType {
        const { ...props } = entity.toJSON();

        return {
            id: props.castMemberId,
            name: props.name,
            type: props.type,
            createdAt: props.createdAt,
        };
    }
}
