import { AggregateRoot } from '../aggregate-root';

export default interface IUnitOfWork {
    start(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    getTransaction(): any;
    execute<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
    addAggregateRoot(aggregateRoot: AggregateRoot): void;
    getAggregatesRoot(): AggregateRoot[];
}
