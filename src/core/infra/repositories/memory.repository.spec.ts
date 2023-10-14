import Entity from "../../domain/entities/entity";
import MemoryRespository from "./memory.repository";
import Uuid from "../../domain/value-objects/uuid.vo";
import EntityNotFoundException from "../../domain/exceptions/entity-not-found.exception";

type EntityStubProps = {
    entityId?: Uuid;
    name: string;
    price: number;
}

class EntityStub extends Entity {
    entityId: Uuid;
    name: string;
    price: number;

    constructor(props: EntityStubProps) {
        super();
        this.entityId = props.entityId || new Uuid();
        this.name = props.name;
        this.price = props.price;
    }
    
    toJSON() {
        return {
            entityId: this.entityId.value,
            name: this.name,
            price: this.price,
        }
    }
}

class StubMemoryRepository extends MemoryRespository<EntityStub, Uuid> {
    getEntity(): new (...args: any[]) => EntityStub {
        return EntityStub;
    }

}

describe('Unit Test Memory repository', () => {
    let repository: StubMemoryRepository;

    beforeEach(() => {
        repository = new StubMemoryRepository();
    })

    test('Should insert an entity', async () => {
        const entity = new EntityStub({
            name: 'Test',
            price: 100
        })

        await repository.insert(entity);

        expect(repository.items.length).toBe(1);
        expect(repository.items[0]).toBe(entity)
    })

    test('Should bulk insert entities', async () => {
        const entities = [
            new EntityStub({
                name: 'Test 1',
                price: 100
            }),

            new EntityStub({
                entityId: new Uuid(),
                name: 'Test 2',
                price: 150
            })
        ]

        await repository.bulkInsert(entities);

        expect(repository.items.length).toBe(2);
        expect(repository.items[0]).toBe(entities[0])
        expect(repository.items[1]).toBe(entities[1])
    })

    test('Should return all items', async () => {
        const entities = [
            new EntityStub({
                name: 'Test 1',
                price: 100
            }),

            new EntityStub({
                entityId: new Uuid(),
                name: 'Test 2',
                price: 150
            })
        ];

        await repository.bulkInsert(entities);

        const allItems = await repository.findAll();

        expect(allItems.length).toBe(entities.length);
        expect(allItems).toStrictEqual(entities);
    })

    test('Should found an entity', async () => {
        const entityId = new Uuid();

        const entities = [
            new EntityStub({
                entityId,
                name: 'Test 1',
                price: 100
            }),
        ];

        await repository.bulkInsert(entities);

        const foundItem = await repository.findById(entityId);

        expect(foundItem).toBe(entities[0]);
    })

    describe('Update an Entity', () => {
        test('Should return Exception when update entity not exist', async () => {
            const entity = new EntityStub({
                name: 'Test 1',
                price: 100
            });
            
            await expect(repository.update(entity)).rejects.toThrow(
                new EntityNotFoundException(entity.entityId, EntityStub)
            );
        })

        test('Should update an entity', async () => {
            const entity = new EntityStub({
                name: 'Test 1',
                price: 100
            });

            await repository.insert(entity);

            const entityUpdated = new EntityStub({
                entityId: entity.entityId,
                name: 'Test updated',
                price: 250
            });

            await repository.update(entityUpdated);

            expect(entityUpdated.toJSON()).toStrictEqual(repository.items[0].toJSON());
        })
    })

    describe('Delete an Entity', () => {
        test('Should return Exception when entity not exist', async () => {
            const entityId = new Uuid();
            
            await expect(repository.delete(entityId)).rejects.toThrow(
                new EntityNotFoundException(entityId.value, EntityStub)
            );
        })

        test('Should update an entity', async () => {
            const entity = new EntityStub({
                name: 'Test 1',
                price: 100
            });

            await repository.insert(entity);

            await repository.delete(entity.entityId);

            expect(repository.items).toHaveLength(0);
        })
    })
})