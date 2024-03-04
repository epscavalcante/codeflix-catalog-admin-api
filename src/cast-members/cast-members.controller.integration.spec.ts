import { CastMembersController } from './cast-members.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { CastMembersModule } from './cast-members.module';
import { DatabaseModule } from '../database/database.module';
import CreateCastMemberUseCase from '@core/cast-member/application/use-cases/create-cast-member-use-case';
import ListCastMemberUseCase from '@core/cast-member/application/use-cases/list-cast-member-use-case';
import FindCastMemberUseCase from '@core/cast-member/application/use-cases/find-cast-member.use-case';
import UpdateCastMemberUseCase from '@core/cast-member/application/use-cases/update-cast-member.use-case';
import DeleteCastMemberUseCase from '@core/cast-member/application/use-cases/delete-cast-member.use-case';
import { ConfigModule } from '../config/config.module';
import { AuthModule } from '../auth/auth.module';
// import ICastMemberRepository from '@core/cast-member/domain/cast-member.repository.interface';

describe('CastMembersController Integration tests', () => {
    let controller: CastMembersController;
    // let repository: ICastMemberRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot(),
                DatabaseModule,
                AuthModule,
                CastMembersModule,
            ],
        }).compile();
        controller = module.get<CastMembersController>(CastMembersController);
        // repository = module.get<ICastMemberRepository>(
        //     CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        // );
    });

    test('Deve instanciar corretamente os componentes', () => {
        expect(controller).toBeDefined();
        expect(controller['createCastMemberUseCase']).toBeInstanceOf(
            CreateCastMemberUseCase,
        );
        expect(controller['listCastMemberUseCase']).toBeInstanceOf(
            ListCastMemberUseCase,
        );
        expect(controller['findCastMemberUseCase']).toBeInstanceOf(
            FindCastMemberUseCase,
        );
        expect(controller['updateCastMemberUseCase']).toBeInstanceOf(
            UpdateCastMemberUseCase,
        );
        expect(controller['deleteCastMemberUseCase']).toBeInstanceOf(
            DeleteCastMemberUseCase,
        );
    });
});
