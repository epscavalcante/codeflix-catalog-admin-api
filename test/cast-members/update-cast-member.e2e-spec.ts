import { instanceToPlain } from 'class-transformer';
import { startApp } from '../helpers/start-app';
import request from 'supertest';
import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import { UpdateCastMemberFixture } from '../../src/cast-members/cast-members.fixture';
import CastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import { CAST_MEMBER_PROVIDERS } from '../../src/cast-members/cast-members.provider';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import { CastMemberPresenter } from '../../src/cast-members/cast-members.presenter';
import CastMemberOutputMapper from '@core/cast-member/application/use-cases/mappers/cast-member-output.mapper';

describe('CastMembersController (e2e)', () => {
    const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

    describe('PATCH /cast-members/:id', () => {
        describe('should a response error when id is invalid or not found', () => {
            const nestApp = startApp();
            const faker = CastMember.fake().aDirector();
            const arrange = [
                {
                    id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
                    send_data: { name: faker.name },
                    expected: {
                        statusCode: 404,
                        message:
                            'CastMember not found using ID: 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
                        error: 'Not Found',
                    },
                },
                {
                    id: 'fake id',
                    send_data: { name: faker.name },
                    expected: {
                        statusCode: 422,
                        error: 'Unprocessable Entity',
                        message: 'Validation failed (uuid is expected)',
                    },
                },
            ];

            test.each(arrange)(
                'when id is $id',
                async ({ id, send_data, expected }) => {
                    return request(nestApp.app.getHttpServer())
                        .patch(`/cast-members/${id}`)
                        .send(send_data)
                        .expect(expected.statusCode)
                        .expect(expected);
                },
            );
        });

        describe('should a response error with 422 when request body is invalid', () => {
            const app = startApp();
            const invalidRequest =
                UpdateCastMemberFixture.arrangeInvalidRequest();
            const arrange = Object.keys(invalidRequest).map((key) => ({
                label: key,
                value: invalidRequest[key],
            }));
            test.each(arrange)('when body is $label', ({ value }) => {
                return request(app.app.getHttpServer())
                    .patch(`/cast-members/${uuid}`)
                    .send(value.send_data)
                    .expect(422)
                    .expect(value.expected);
            });
        });

        describe('should a response error with 422 when throw EntityValidationError', () => {
            const app = startApp();
            const validationError =
                UpdateCastMemberFixture.arrangeForEntityValidationError();
            const arrange = Object.keys(validationError).map((key) => ({
                label: key,
                value: validationError[key],
            }));
            let repository: CastMemberRepository;

            beforeEach(() => {
                repository = app.app.get<CastMemberRepository>(
                    CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY
                        .provide,
                );
            });
            test.each(arrange)('when body is $label', async ({ value }) => {
                const category = CastMember.fake().aDirector().build();
                await repository.insert(category);
                return request(app.app.getHttpServer())
                    .patch(`/cast-members/${category.castMemberId.value}`)
                    .send(value.send_data)
                    .expect(422)
                    .expect(value.expected);
            });
        });

        describe('should update a category', () => {
            const appHelper = startApp();
            const arrange = UpdateCastMemberFixture.arrangeForUpdate();
            let repository: CastMemberRepository;

            beforeEach(async () => {
                repository = appHelper.app.get<CastMemberRepository>(
                    CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY
                        .provide,
                );
            });
            test.each(arrange)(
                'when body is $send_data',
                async ({ send_data, expected }) => {
                    const categoryCreated = CastMember.fake()
                        .aDirector()
                        .build();
                    await repository.insert(categoryCreated);

                    const res = await request(appHelper.app.getHttpServer())
                        .patch(
                            `/cast-members/${categoryCreated.castMemberId.value}`,
                        )
                        .send(send_data)
                        .expect(200);
                    const id = res.body.id;
                    const categoryUpdated = await repository.findById(
                        new CastMemberId(id),
                    );
                    const presenter = new CastMemberPresenter(
                        CastMemberOutputMapper.toOutput(categoryUpdated!),
                    );
                    const serialized = instanceToPlain(presenter);
                    expect(res.body).toStrictEqual(serialized);
                    expect(res.body).toStrictEqual({
                        id: serialized.id,
                        createdAt: serialized.createdAt,
                        name: expected.name ?? categoryUpdated!.name,
                        type: expected.type ?? categoryUpdated!.type,
                    });
                },
            );
        });
    });
});
