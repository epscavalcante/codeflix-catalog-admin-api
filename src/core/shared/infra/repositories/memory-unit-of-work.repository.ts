import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';

export default class MemoryUnitOfWorkRepository implements IUnitOfWork {
    private aggregatesRoot: Set<AggregateRoot> = new Set<AggregateRoot>();

    async start(): Promise<void> {
        return;
    }
    async commit(): Promise<void> {
        return;
    }
    async rollback(): Promise<void> {
        return;
    }
    getTransaction() {
        return;
    }
    async execute<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
        return fn(this);
    }

    addAggregateRoot(aggregateRoot: AggregateRoot): void {
        this.aggregatesRoot.add(aggregateRoot);
    }

    getAggregatesRoot(): AggregateRoot[] {
        return Array.from(this.aggregatesRoot);
    }
}
