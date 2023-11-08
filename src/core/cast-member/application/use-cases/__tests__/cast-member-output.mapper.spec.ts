import CastMember from "@core/cast-member/domain/cast-member.aggregate";
import CastMemberOutputMapper from "../mappers/cast-member-output.mapper";

describe('CastMember Usecases Output Unit Test', () => {
    test('Deve converter categoria para output do usecase', () => {
        const category = CastMember.fake()
            .aDirector()
            .withName('Teste')
            .build();

        const spyToJson = jest.spyOn(category, 'toJSON');

        const output = CastMemberOutputMapper.toOutput(category);

        expect(spyToJson).toHaveBeenCalled();
        expect(output).toStrictEqual({
            id: category.castMemberId.value,
            name: category.name,
            type: category.type.value,
            createdAt: category.createdAt,
        });
    });
});
