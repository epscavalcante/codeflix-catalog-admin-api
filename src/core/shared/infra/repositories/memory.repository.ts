import Entity from '../../domain/entity';
import IRepository from '@core/shared/domain/repositories/repository.interface';
import ValueObject from '@core/shared/domain/value-objects/value-object';
import EntityNotFoundException from '@core/shared/domain/exceptions/entity-not-found.exception';

export default abstract class MemoryRespository<
    E extends Entity,
    Uuid extends ValueObject,
> implements IRepository<E, Uuid>
{
    items: E[] = [];

    async insert(entity: E): Promise<void> {
        this.items.push(entity);
    }

    async bulkInsert(entities: E[]): Promise<void> {
        this.items.push(...entities);
    }

    async update(entity: E): Promise<void> {
        const itemIndex = this.items.findIndex((item) =>
            item.entityId.equals(entity.entityId),
        );

        if (itemIndex === -1) {
            throw new EntityNotFoundException(
                entity.entityId,
                this.getEntity(),
            );
        }

        this.items[itemIndex] = entity;
    }

    async delete(entityId: Uuid): Promise<void> {
        const itemIndex = this.items.findIndex((item) =>
            item.entityId.equals(entityId),
        );

        if (itemIndex === -1) {
            throw new EntityNotFoundException(entityId, this.getEntity());
        }

        this.items.splice(itemIndex, 1);
    }

    async findAll(): Promise<E[]> {
        return this.items;
    }

    async findById(entityId: Uuid): Promise<E | null> {
        return this._get(entityId);
    }

    protected _get(entityId: Uuid) {
        const item = this.items.find((item) => item.entityId.equals(entityId));

        return typeof item === 'undefined' ? null : item;
    }

    abstract getEntity(): new (...args: any[]) => E;
}
