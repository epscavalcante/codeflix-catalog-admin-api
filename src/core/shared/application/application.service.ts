import DomainEventMediator from '../domain/domain-events/domain-event.mediator';
import IUnitOfWork from '../domain/repositories/unit-of-work.interface';

export default class ApplicationService {
    constructor(
        private unitOfWork: IUnitOfWork,
        private domainEventMediator: DomainEventMediator,
    ) {}

    async run<T>(callback: () => Promise<T>): Promise<T> {
        await this.start();
        try {
            const result = await callback();
            await this.finish();
            return result;
        } catch (error) {
            await this.fail();
            throw error;
        }
    }

    async start() {
        await this.unitOfWork.start();
    }

    async finish() {
        const aggregates = this.unitOfWork.getAggregatesRoot();
        for (const aggregate of aggregates) {
            await this.domainEventMediator.publish(aggregate);
        }
        await this.unitOfWork.commit();
        for (const aggregate of aggregates) {
            await this.domainEventMediator.publishIntegrationEvents(aggregate);
        }
    }

    async fail() {
        await this.unitOfWork.rollback();
    }
}
