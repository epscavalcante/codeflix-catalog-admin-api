import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberOutput } from '../mappers/create-cast-member.use-case.output';
import CastMemberType from '@core/cast-member/domain/cast-member-type.value-object';

describe('CastMemberOutput Tests', () => {
    it('should convert a cast member in output', () => {
        const entity = CastMember.create({
            name: 'Movie',
            type: CastMemberType.createAnActor(),
        });
        const spyToJSON = jest.spyOn(entity, 'toJSON');
        const output = CastMemberOutput.toOutput(entity);
        expect(spyToJSON).toHaveBeenCalled();
        expect(output).toStrictEqual({
            id: entity.castMemberId.value,
            name: 'Movie',
            type: CastMemberType.createAnActor().value,
            createdAt: entity.createdAt,
        });
    });
});
