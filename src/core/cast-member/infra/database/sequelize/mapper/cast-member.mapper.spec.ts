import { setupDatabase } from "@core/shared/infra/database/setup-database";
import CastMemberModel from "../models/cast-member.model";
import { CastMemberId } from "@core/cast-member/domain/cast-member-id.value-object";
import CastMemberMapper from "./cast-member.mapper";
import CastMember from "@core/cast-member/domain/cast-member.aggregate";
import EntityValidationError from "@core/shared/domain/errors/entity-validation.error";

describe('CastMember Mapper Integration Tests', () => {
    // let repository: CastMemberSequelizeRepository;

    setupDatabase({ models: [CastMemberModel] });

    // beforeEach(async () => {
    //     repository = new CastMemberSequelizeRepository(CastMemberModel);
    // });

    describe('CastMember map Model to Entity', () => {
        test('Should receives entity validation exception', () => {
            const castMemberModel = CastMemberModel.build({
                castMemberId: new CastMemberId().value,
                name: 'a'.repeat(256),
                type: 4 as any,
                createdAt: new Date(),
            });

            try {
                CastMemberMapper.toEntity(castMemberModel);
                fail('CastMember is valid, but needs throws ');
            } catch (error) {
                expect(error).toBeInstanceOf(EntityValidationError);
                expect(
                    (error as EntityValidationError).error,
                ).toMatchObject([
                    {
                        name: [
                            'name must be shorter than or equal to 255 characters',
                        ]
                    },
                    {
                        type: [
                            'Invalid cast member type: 4'
                        ]
                    }
                ]);
            }
        });

        test('Should mapper model to entity', () => {
            const castMember = CastMember.fake().anActor().build();

            const castMemberModel = CastMemberModel.build({
                castMemberId: castMember.castMemberId.value,
                name: castMember.name,
                type: castMember.type.value,
                createdAt: castMember.createdAt,
            });

            const castMemberEntityMapped = CastMemberMapper.toEntity(castMemberModel);

            expect(castMemberEntityMapped.toJSON()).toStrictEqual(
                castMember.toJSON(),
            );
        });
    });

    describe('CastMember entity to Model', () => {
        test('Map entity to Model', () => {
            const castMember = CastMember.fake().aDirector().build();

            const castMemberModel = CastMemberMapper.toModel(castMember);

            expect(castMemberModel.toJSON()).toStrictEqual({
                castMemberId: castMember.castMemberId.value,
                name: castMember.name,
                type: castMember.type.value,
                createdAt: castMember.createdAt,
            });
        });
    });
});
