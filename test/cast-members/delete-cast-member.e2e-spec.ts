import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import CastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import { CAST_MEMBER_PROVIDERS } from '../../src/cast-members/cast-members.provider';
import { startApp } from '../helpers/start-app';
import request from 'supertest';

describe('CastMembersController (e2e)', () => {
    describe('DELETE /delete/:id', () => {
        const appHelper = startApp();
        describe('should a response error when id is invalid or not found', () => {
            const arrange = [
                {
                    id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
                    expected: {
                        statusCode: 404,
                        error: 'Not Found',
                        message:
                            'CastMember not found using ID: 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
                    },
                },
                {
                    id: 'fake id',
                    expected: {
                        statusCode: 422,
                        error: 'Unprocessable Entity',
                        message: 'Validation failed (uuid is expected)',
                    },
                },
            ];

            test.each(arrange)('when id is $id', async ({ id, expected }) => {
                return request(appHelper.app.getHttpServer())
                    .delete(`/cast-members/${id}`)
                    .expect(expected.statusCode)
                    .expect(expected);
            });
        });

        it('should delete a castMember response with status 204', async () => {
            const castMemberRepository =
                appHelper.app.get<CastMemberRepository>(
                    CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY
                        .provide,
                );
            const castMember = CastMember.fake().aDirector().build();
            await castMemberRepository.insert(castMember);

            await request(appHelper.app.getHttpServer())
                .delete(`/cast-members/${castMember.castMemberId.value}`)
                .expect(204);

            await expect(
                castMemberRepository.findById(castMember.castMemberId),
            ).resolves.toBeNull();
        });
    });
});
