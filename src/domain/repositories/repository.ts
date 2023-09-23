import Uuid from "../value-objects/uuid.vo";
import Entity from "../entities/entity";
import ValueObject from "../value-objects/value-object";

export default interface IRepository<E extends Entity, Uuid extends ValueObject> {
    insert(entity: E): Promise<void>;
    bulkInsert(entities: E[]): Promise<void>;
    update(entity: E): Promise<void>;
    // bulkUpdates(entities: E[]): Promise<void>;
    delete(entityId: Uuid): Promise<void>;
    findAll(): Promise<E[]>;
    findById(entityId: Uuid): Promise<E | null>;
    getEntity(): new (...args: any[]) => E;
}
