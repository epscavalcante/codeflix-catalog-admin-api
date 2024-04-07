import { CreateCastMemberOutput } from '@core/cast-member/application/use-cases/create-cast-member-use-case';
import { CastMembersController } from './cast-members.controller';
import { CastMemberTypeEnum } from '@core/cast-member/domain/cast-member-type.value-object';
import { CreateCastMemberDto } from './dto/create-cast-member.dto';
import {
    CastMemberCollectionPresenter,
    CastMemberPresenter,
} from './cast-members.presenter';
import { SortDirection } from '@core/shared/domain/repositories/searchable.repository.interface';
import { ListCastMembersOutput } from '@core/cast-member/application/use-cases/list-cast-member-use-case';
import { UpdateCastMemberOutput } from '@core/cast-member/application/use-cases/update-cast-member.use-case';
import { UpdateCastMemberDto } from './dto/update-cast-member.dto';
import { FindCastMemberOutput } from '@core/cast-member/application/use-cases/find-cast-member.use-case';

describe('CastMembersController Unit Tests', () => {
    let controller: CastMembersController;

    beforeEach(async () => {
        controller = new CastMembersController();
    });

    it('should creates a cast member', async () => {
        const output: CreateCastMemberOutput = {
            id: '9366b7dc-2d71-4799-b91c-c64adb205104',
            name: 'Member',
            type: CastMemberTypeEnum.ACTOR,
            createdAt: new Date(),
        };
        const mockCreateUseCase = {
            handle: jest.fn().mockReturnValue(Promise.resolve(output)),
        };
        //@ts-expect-error todo
        controller['createCastMemberUseCase'] = mockCreateUseCase;
        const input: CreateCastMemberDto = {
            name: 'Member',
            type: CastMemberTypeEnum.ACTOR,
        };
        const presenter = await controller.create(input);
        expect(mockCreateUseCase.handle).toHaveBeenCalledWith(input);
        expect(presenter).toBeInstanceOf(CastMemberPresenter);
        expect(presenter).toStrictEqual(new CastMemberPresenter(output));
        //expect(expectedOutput).toStrictEqual(output);
    });

    it('should updates a cast member', async () => {
        const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
        const output: UpdateCastMemberOutput = {
            id,
            name: 'Member',
            type: CastMemberTypeEnum.ACTOR,
            createdAt: new Date(),
        };
        const mockUpdateUseCase = {
            handle: jest.fn().mockReturnValue(Promise.resolve(output)),
        };

        //@ts-expect-error todo
        controller['updateCastMemberUseCase'] = mockUpdateUseCase;
        const input: UpdateCastMemberDto = {
            name: 'Member',
            type: CastMemberTypeEnum.ACTOR,
        };
        const presenter = await controller.update(id, input);
        expect(mockUpdateUseCase.handle).toHaveBeenCalledWith({
            id,
            ...input,
        });
        expect(presenter).toBeInstanceOf(CastMemberPresenter);
        expect(presenter).toStrictEqual(new CastMemberPresenter(output));
    });

    it('should deletes a cast member', async () => {
        const expectedOutput = undefined;
        const mockDeleteUseCase = {
            handle: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
        };

        //@ts-expect-error todo
        controller['deleteCastMemberUseCase'] = mockDeleteUseCase;
        const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
        expect(controller.remove(id)).toBeInstanceOf(Promise);
        const output = await controller.remove(id);
        expect(mockDeleteUseCase.handle).toHaveBeenCalledWith({ id });
        expect(expectedOutput).toStrictEqual(output);
    });

    it('should gets a cast member', async () => {
        const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
        const output: FindCastMemberOutput = {
            id,
            name: 'Member',
            type: CastMemberTypeEnum.ACTOR,
            createdAt: new Date(),
        };
        const mockGetUseCase = {
            handle: jest.fn().mockReturnValue(Promise.resolve(output)),
        };

        //@ts-expect-error todo
        controller['findCastMemberUseCase'] = mockGetUseCase;
        const presenter = await controller.findOne(id);
        expect(mockGetUseCase.handle).toHaveBeenCalledWith({ id });
        expect(presenter).toBeInstanceOf(CastMemberPresenter);
        expect(presenter).toStrictEqual(new CastMemberPresenter(output));
    });

    it('should list cast members', async () => {
        const output: ListCastMembersOutput = {
            items: [
                {
                    id: '9366b7dc-2d71-4799-b91c-c64adb205104',
                    name: 'Member',
                    type: CastMemberTypeEnum.ACTOR,
                    createdAt: new Date(),
                },
            ],
            currentPage: 1,
            lastPage: 1,
            perPage: 1,
            total: 1,
        };
        const mockListUseCase = {
            handle: jest.fn().mockReturnValue(Promise.resolve(output)),
        };

        //@ts-expect-error todo
        controller['listCastMemberUseCase'] = mockListUseCase;
        const searchParams = {
            page: 1,
            per_page: 2,
            sort: 'name',
            sort_dir: 'desc' as SortDirection,
            filter: { name: 'actor test' },
        };
        const presenter = await controller.search(searchParams);
        expect(presenter).toBeInstanceOf(CastMemberCollectionPresenter);
        expect(mockListUseCase.handle).toHaveBeenCalledWith(searchParams);
        expect(presenter).toEqual(new CastMemberCollectionPresenter(output));
    });
});
