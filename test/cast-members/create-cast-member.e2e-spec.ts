import request from 'supertest';
import { startApp } from '../helpers/start-app';
import { instanceToPlain } from 'class-transformer';
import { CAST_MEMBER_PROVIDERS } from '../../src/cast-members/cast-members.provider';
import CastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import { CreateCastMemberFixture } from '../../src/cast-members/cast-members.fixture';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import { CastMemberPresenter } from '../../src/cast-members/cast-members.presenter';
import CastMemberOutputMapper from '@core/cast-member/application/use-cases/mappers/cast-member-output.mapper';

describe('CastMembersController (e2e)', () => {
    const appHelper = startApp();

    let repository: CastMemberRepository;

    beforeEach(async () => {
        repository = appHelper.app.get<CastMemberRepository>(
            CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
    });

    describe('POST /cast-members', () => {
        describe('Should create castMember', () => {
            const arrange = CreateCastMemberFixture.arrangeForCreate();

            test.each(arrange)(
                'When body is $send_data',
                async ({ send_data, expected }) => {
                    const response = await request(
                        appHelper.app.getHttpServer(),
                    )
                        .post('/cast-members')
                        .authenticate(appHelper.app)
                        .send(send_data);

                    expect(response.status).toBe(201);

                    const castMemberResponse = response.body;
                    const castMemberCreated = await repository.findById(
                        new CastMemberId(castMemberResponse.id),
                    );
                    const presenter = new CastMemberPresenter(
                        CastMemberOutputMapper.toOutput(castMemberCreated!),
                    );
                    const castMemberSerialized = instanceToPlain(presenter);

                    expect(castMemberResponse).toStrictEqual({
                        id: castMemberSerialized.id,
                        createdAt: castMemberSerialized.createdAt,
                        ...expected,
                    });
                },
            );
        });

        describe('Should receives 422 statusCode when send invalid data', () => {
            const invalidRequest =
                CreateCastMemberFixture.arrangeInvalidRequest();
            const arrange = Object.keys(invalidRequest).map((key) => ({
                label: key,
                value: invalidRequest[key],
            }));

            test.each(arrange)('When body is $label', async ({ value }) => {
                return request(appHelper.app.getHttpServer())
                    .post('/cast-members')
                    .authenticate(appHelper.app)
                    .send(value.send_data)
                    .expect(422)
                    .expect(value.expected);
            });
        });

        describe('Should receives 422 statusCode when send throw EntityValidationError', () => {
            const invalidRequest =
                CreateCastMemberFixture.arrangeForEntityValidationError();
            const arrange = Object.keys(invalidRequest).map((key) => ({
                label: key,
                value: invalidRequest[key],
            }));

            test.each(arrange)('When body is $label', async ({ value }) => {
                return request(appHelper.app.getHttpServer())
                    .post('/cast-members')
                    .authenticate(appHelper.app)
                    .send(value.send_data)
                    .expect(422)
                    .expect(value.expected);
            });
        });
    });
});
