import CastMember from '@core/cast-member/domain/cast-member.aggregate';

export type CastMemberOutputType = {
    id: string;
    name: string;
    type: number;
    createdAt: Date;
};

export default class CastMemberOutputMapper {
    static toOutput(castMember: CastMember): CastMemberOutputType {
        const { castMemberId, ...props } = castMember.toJSON();

        return {
            id: castMemberId,
            ...props,
        };
    }
}
