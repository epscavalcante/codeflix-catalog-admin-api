import { instanceToPlain } from 'class-transformer';
import { startApp } from '../helpers/start-app';
import request from 'supertest';
import CastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import { ListCastMemberFixture } from '../../src/cast-members/cast-members.fixture';
import { CAST_MEMBER_PROVIDERS } from '../../src/cast-members/cast-members.provider';
import { CastMemberPresenter } from '../../src/cast-members/cast-members.presenter';
import CastMemberOutputMapper from '@core/cast-member/application/use-cases/mappers/cast-member-output.mapper';
import qs from 'qs';

describe('CastMembersController (e2e)', () => {
    describe('GET /cast-members', () => {
        describe('should return cast members sorted by created_at when request query is empty', () => {
            let castMemberRepository: CastMemberRepository;
            const appHelper = startApp();
            const { entitiesMap, arrange } =
                ListCastMemberFixture.arrangeIncrementedWithCreatedAt();

            beforeEach(async () => {
                castMemberRepository = appHelper.app.get<CastMemberRepository>(
                    CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY
                        .provide,
                );
                await castMemberRepository.bulkInsert(
                    Object.values(entitiesMap),
                );
            });

            test.each(arrange)(
                'when query params is $send_data',
                async ({ send_data, expected }) => {
                    const queryParams = new URLSearchParams(
                        send_data as any,
                    ).toString();
                    return request(appHelper.app.getHttpServer())
                        .get(`/cast-members/?${queryParams}`)
                        .authenticate(appHelper.app)
                        .expect(200)
                        .expect({
                            data: expected.entities.map((e) =>
                                instanceToPlain(
                                    new CastMemberPresenter(
                                        CastMemberOutputMapper.toOutput(e),
                                    ),
                                ),
                            ),
                            meta: expected.meta,
                        });
                },
            );
        });

        describe('should return cast members using paginate, filter and sort', () => {
            let castMemberRepository: CastMemberRepository;
            const appHelper = startApp();
            const {
                entitiesMap,
                arrangeFilteredByNameAndAscSortedByName,
                arrangeFilteredByNameAndDescSortedByName,
                arrangeFilteredByType,
            } = ListCastMemberFixture.arrangeUnsorted();

            beforeEach(async () => {
                castMemberRepository = appHelper.app.get<CastMemberRepository>(
                    CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY
                        .provide,
                );
                await castMemberRepository.bulkInsert(
                    Object.values(entitiesMap),
                );
            });

            test.each([
                arrangeFilteredByNameAndAscSortedByName[0],
                arrangeFilteredByNameAndDescSortedByName[0],
                arrangeFilteredByType[0],
            ])(
                'when query params is $send_data',
                async ({ send_data, expected }) => {
                    const queryParams = qs.stringify(send_data as any);

                    return request(appHelper.app.getHttpServer())
                        .get(`/cast-members?${queryParams}`)
                        .authenticate(appHelper.app)
                        .expect({
                            data: expected.entities.map((e) =>
                                instanceToPlain(
                                    new CastMemberPresenter(
                                        CastMemberOutputMapper.toOutput(e),
                                    ),
                                ),
                            ),
                            meta: expected.meta,
                        });
                },
            );
        });
    });
});
