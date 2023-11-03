import Category, { CategoryId } from "../../domain/entities/category.aggregate";
import CategoryMemoryRepository from "./category-memory.repository";
import EntityNotFoundException from "../../domain/exceptions/entity-not-found.exception";

describe('Unit Test Memory repository', () => {
    let repository: CategoryMemoryRepository;

    beforeEach(() => repository = new CategoryMemoryRepository())

    test('Should insert an entity', async () => {
        const entity = Category.fake().aCategory().build();

        await repository.insert(entity);

        expect(repository.items.length).toBe(1);
        expect(repository.items[0]).toBe(entity)
    })

    test('Should bulk insert entities', async () => {
        const entities = Category.fake().theCategories(2).build();

        await repository.bulkInsert(entities);

        expect(repository.items.length).toBe(2);
        expect(repository.items[0]).toBe(entities[0])
        expect(repository.items[1]).toBe(entities[1])
    })

    test('Should return all items', async () => {
        const entities = Category.fake().theCategories(2).build()

        await repository.bulkInsert(entities);

        const allItems = await repository.findAll();

        expect(allItems.length).toBe(entities.length);
        expect(allItems).toStrictEqual(entities);
    })

    test('Should found an entity', async () => {
        const entityId = new CategoryId();

        const entities = [
            Category.fake().aCategory().withUuid(entityId).build()
        ];

        await repository.bulkInsert(entities);

        const foundItem = await repository.findById(entityId);

        expect(foundItem).toBe(entities[0]);
    })

    describe('Update an Entity', () => {
        test('Should return Exception when update entity not exist', async () => {
            const entity = Category.fake().aCategory().build();
            
            await expect(repository.update(entity)).rejects.toThrow(
                new EntityNotFoundException(entity.entityId, Category)
            );
        })

        test('Should update an entity', async () => {
            const entity = Category.fake().aCategory().build()

            await repository.insert(entity);

            const entityUpdated = Category.fake().aCategory()
            .withUuid(entity.categoryId)
            .withName('Test updated')
            .build();

            await repository.update(entityUpdated);

            expect(entityUpdated.toJSON()).toStrictEqual(repository.items[0].toJSON());
        })
    })

    describe('Delete an Entity', () => {
        test('Should return Exception when entity not exist', async () => {
            const entityId = new CategoryId();
            
            await expect(repository.delete(entityId)).rejects.toThrow(
                new EntityNotFoundException(entityId.value, Category)
            );
        })

        test('Should update an entity', async () => {
            const entity = Category.fake().aCategory().build()

            await repository.insert(entity);

            await repository.delete(entity.categoryId);

            expect(repository.items).toHaveLength(0);
        })
    })
})