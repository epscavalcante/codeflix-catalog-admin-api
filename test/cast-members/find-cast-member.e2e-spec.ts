import CastMemberOutputMapper from '@core/cast-member/application/use-cases/mappers/cast-member-output.mapper';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import CastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { startApp } from '../helpers/start-app';
import { CAST_MEMBER_PROVIDERS } from '../../src/cast-members/cast-members.provider';
import { CastMemberPresenter } from '../../src/cast-members/cast-members.presenter';

describe('CastMembersController (e2e)', () => {
    const nestApp = startApp();
    describe('GET /cast-members/:id', () => {
        test('Response not found', async () => {
            const arrange = {
                id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
                expected: {
                    statusCode: 404,
                    error: 'Not Found',
                    message:
                        'CastMember not found using ID: 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
                },
            };

            const response = await request(nestApp.app.getHttpServer())
                .get(`/cast-members/${arrange.id}`)
                .authenticate(nestApp.app);

            expect(response.status).toBe(arrange.expected.statusCode);
            expect(response.body.statusCode).toBe(arrange.expected.statusCode);
            expect(response.body.error).toBe(arrange.expected.error);
            expect(response.body.message).toBe(arrange.expected.message);
        });

        test('Response Invalid uuid', () => {
            const arrange = {
                id: 'fake id',
                expected: {
                    statusCode: 422,
                    error: 'Unprocessable Entity',
                    message: 'Validation failed (uuid is expected)',
                },
            };

            return request(nestApp.app.getHttpServer())
                .get(`/cast-members/${arrange.id}`)
                .authenticate(nestApp.app)
                .expect(arrange.expected.statusCode)
                .expect(arrange.expected);
        });

        test('should return a castMember ', async () => {
            const repository = nestApp.app.get<CastMemberRepository>(
                CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY
                    .provide,
            );
            const castMember = CastMember.fake().aDirector().build();
            await repository.insert(castMember);

            const res = await request(nestApp.app.getHttpServer())
                .get(`/cast-members/${castMember.castMemberId.value}`)
                .authenticate(nestApp.app)
                .expect(200);

            const presenter = new CastMemberPresenter(
                CastMemberOutputMapper.toOutput(castMember),
            );
            const serialized = instanceToPlain(presenter);
            expect(res.body).toStrictEqual(serialized);
        });
    });
});
