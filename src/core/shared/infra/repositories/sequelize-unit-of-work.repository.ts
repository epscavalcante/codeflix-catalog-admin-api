import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';
import { Sequelize, Transaction } from 'sequelize';

export default class SequelizeUnitOfWorkRepository implements IUnitOfWork {
    private transaction: Transaction | null;

    constructor(private readonly sequelize: Sequelize) {}

    async start(): Promise<void> {
        if (!this.transaction)
            this.transaction = await this.sequelize.transaction();
    }
    async commit(): Promise<void> {
        this.validateTransaction();
        await this.transaction!.commit();
        this.transaction = null;
    }
    async rollback(): Promise<void> {
        this.validateTransaction();
        await this.transaction!.rollback();
        this.transaction = null;
    }
    getTransaction() {
        return this.transaction;
    }
    async execute<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
        try {
            if (this.transaction) {
                const result = await fn(this);
                this.transaction = null;
                return result;
            }

            return this.sequelize.transaction(async (trx) => {
                this.transaction = trx;
                const result = await fn(this);
                this.transaction = null;
                return result;
            });
        } catch (error) {
            if (this.transaction) await this.transaction.rollback();

            throw error;
        }
    }

    private validateTransaction() {
        if (!this.transaction) throw new Error('Transaction not started.');
    }
}
