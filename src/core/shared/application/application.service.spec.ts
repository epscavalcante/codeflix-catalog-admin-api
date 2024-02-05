import EventEmitter2 from 'eventemitter2';
import DomainEventMediator from '../domain/domain-events/domain-event.mediator';
import IUnitOfWork from '../domain/repositories/unit-of-work.interface';
import MemoryUnitOfWorkRepository from '../infra/repositories/memory-unit-of-work.repository';
import ApplicationService from './application.service';
import { AggregateRoot } from '../domain/aggregate-root';
import Uuid from '../domain/value-objects/uuid.vo';

class StubAggregateRoot extends AggregateRoot {
    constructor(
        readonly id: Uuid,
        readonly name: string,
    ) {
        super();
    }

    toJSON() {
        return {
            id: this.id.value,
            name: this.name,
        };
    }
    get entityId() {
        return this.id;
    }
}

describe('Application service Unit Tests', () => {
    let unitOfWork: IUnitOfWork;
    let domainEventMediator: DomainEventMediator;
    let applicationService: ApplicationService;

    beforeEach(() => {
        unitOfWork = new MemoryUnitOfWorkRepository();
        domainEventMediator = new DomainEventMediator(new EventEmitter2());
        applicationService = new ApplicationService(
            unitOfWork,
            domainEventMediator,
        );
    });

    describe('Method start', () => {
        test('Deve chamar o método start do UnitOfWork', async () => {
            const startUnitOfWorkSpy = jest.spyOn(unitOfWork, 'start');
            await applicationService.start();
            expect(startUnitOfWorkSpy).toHaveBeenCalled();
        });
    });

    describe('Method fail', () => {
        test('Deve chamar o método rollback do UnitOfWork', async () => {
            const rollbackUnitOfWorkSpy = jest.spyOn(unitOfWork, 'rollback');
            await applicationService.fail();
            expect(rollbackUnitOfWorkSpy).toHaveBeenCalled();
        });
    });

    describe('Method finish', () => {
        test('Deve chamar o método commit do UnitOfWork e o publish do DomainEventMediator', async () => {
            const aggregateRoot = new StubAggregateRoot(new Uuid(), 'name');
            unitOfWork.addAggregateRoot(aggregateRoot);
            const commitUnitOfWorkSpy = jest.spyOn(unitOfWork, 'commit');
            const publishDomainEventMediatorSpy = jest.spyOn(
                domainEventMediator,
                'publish',
            );
            await applicationService.finish();
            expect(publishDomainEventMediatorSpy).toBeCalledWith(aggregateRoot);
            expect(commitUnitOfWorkSpy).toBeCalled();
        });
    });

    describe('Method run', () => {
        test('Deve chamar o método start e finish do ApplicationService, executar o callback e retornar o result', async () => {
            const callback = jest.fn().mockResolvedValue('result');
            const startApplicationServiceSpy = jest.spyOn(
                applicationService,
                'start',
            );
            const finishApplicationServiceSpy = jest.spyOn(
                applicationService,
                'finish',
            );
            const result = await applicationService.run(callback);
            expect(startApplicationServiceSpy).toBeCalled();
            expect(callback).toBeCalled();
            expect(finishApplicationServiceSpy).toBeCalled();
            expect(result).toBe('result');
        });

        test('Deve chamar o método start e fail do ApplicationService ao executar o callback com erro', async () => {
            const callback = jest.fn().mockRejectedValue(new Error('error'));
            const startApplicationServiceSpy = jest.spyOn(
                applicationService,
                'start',
            );
            const failApplicationServiceSpy = jest.spyOn(
                applicationService,
                'fail',
            );
            await expect(applicationService.run(callback)).rejects.toThrowError(
                'error',
            );
            expect(startApplicationServiceSpy).toBeCalled();
            expect(callback).toBeCalled();
            expect(failApplicationServiceSpy).toBeCalled();
        });
    });
});
