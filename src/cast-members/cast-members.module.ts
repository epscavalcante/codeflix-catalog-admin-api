import { Module } from '@nestjs/common';
import { CastMembersController } from './cast-members.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import CastMemberModel from '@core/cast-member/infra/database/sequelize/models/cast-member.model';
import { CAST_MEMBER_PROVIDERS } from './cast-members.provider';

@Module({
    imports: [SequelizeModule.forFeature([CastMemberModel])],
    controllers: [CastMembersController],
    providers: [
        ...Object.values(CAST_MEMBER_PROVIDERS.REPOSITORIES),
        ...Object.values(CAST_MEMBER_PROVIDERS.USE_CASES),
        ...Object.values(CAST_MEMBER_PROVIDERS.VALIDATIONS),
    ],
    exports: [
        CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        CAST_MEMBER_PROVIDERS.VALIDATIONS
            .CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
    ],
})
export class CastMembersModule {}
