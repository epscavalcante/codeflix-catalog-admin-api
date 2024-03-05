import CreateCastMemberUseCase from '@core/cast-member/application/use-cases/create-cast-member-use-case';
import DeleteCastMemberUseCase from '@core/cast-member/application/use-cases/delete-cast-member.use-case';
import FindCastMemberUseCase from '@core/cast-member/application/use-cases/find-cast-member.use-case';
import ListCastMemberUseCase from '@core/cast-member/application/use-cases/list-cast-member-use-case';
import UpdateCastMemberUseCase from '@core/cast-member/application/use-cases/update-cast-member.use-case';
import CastMembersIdsExistsInDatabaseValidation from '@core/cast-member/application/validations/cast-members-ids-exists-in-database.validation';
import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import CastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import CastMemberMemoryRepository from '@core/cast-member/infra/repositories/cast-member-memory.repository';
import CastMemberSequelizeRepository from '@core/cast-member/infra/repositories/cast-member-sequelize.repository';
import { getModelToken } from '@nestjs/sequelize';

export const REPOSITORIES = {
    CAST_MEMBER_REPOSITORY: {
        provide: 'CastMemberRepository',
        useExisting: CastMemberSequelizeRepository,
    },

    CAST_MEMBER_MEMORY_REPOSITORY: {
        provide: CastMemberMemoryRepository,
        useClass: CastMemberMemoryRepository,
    },

    CAST_MEMBER_DATABASE_REPOSITORY: {
        provide: CastMemberSequelizeRepository,
        useFactory: (castMemberModel: typeof CastMemberModel) =>
            new CastMemberSequelizeRepository(castMemberModel),
        inject: [getModelToken(CastMemberModel)],
    },
};

export const USE_CASES = {
    CREATE_CAST_MEMBER_USE_CASE: {
        provide: CreateCastMemberUseCase,
        useFactory: (castMemberRepository: CastMemberRepository) =>
            new CreateCastMemberUseCase(castMemberRepository),
        inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
    },

    FIND_CAST_MEMBER_USE_CASE: {
        provide: FindCastMemberUseCase,
        useFactory: (castMemberRepository: CastMemberRepository) =>
            new FindCastMemberUseCase(castMemberRepository),
        inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
    },

    LIST_CAST_MEMBER_USE_CASE: {
        provide: ListCastMemberUseCase,
        useFactory: (castMemberRepository: CastMemberRepository) =>
            new ListCastMemberUseCase(castMemberRepository),
        inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
    },

    UPDATE_CAST_MEMBER_USE_CASE: {
        provide: UpdateCastMemberUseCase,
        useFactory: (castMemberRepository: CastMemberRepository) =>
            new UpdateCastMemberUseCase(castMemberRepository),
        inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
    },

    DELETE_CAST_MEMBER_USE_CASE: {
        provide: DeleteCastMemberUseCase,
        useFactory: (castMemberRepository: CastMemberRepository) =>
            new DeleteCastMemberUseCase(castMemberRepository),
        inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
    },
};

export const VALIDATIONS = {
    CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR: {
        provide: CastMembersIdsExistsInDatabaseValidation,
        useFactory: (castMemberRepository: ICastMemberRepository) => {
            return new CastMembersIdsExistsInDatabaseValidation(
                castMemberRepository,
            );
        },
        inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
    },
};

export const CAST_MEMBER_PROVIDERS = {
    REPOSITORIES,
    USE_CASES,
    VALIDATIONS,
};
