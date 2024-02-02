import Genre from '@core/genre/domain/genre.aggregate';
import GenreMemoryRepository from './genre-memory.repository';
import GenreId from '@core/genre/domain/genre.id.vo';
import { GenreNotFoundError } from '@core/genre/domain/errors/genre-not-found.error';
import { CategoryId } from '@core/category/domain/category.aggregate';

describe('Unit Test Memory repository', () => {
    let repository: GenreMemoryRepository;

    beforeEach(() => (repository = new GenreMemoryRepository()));

    test('Should insert an entity', async () => {
        const entity = Genre.fake().aGenre().build();

        await repository.insert(entity);

        expect(repository.items.length).toBe(1);
        expect(repository.items[0]).toBe(entity);
    });

    test('Should bulk insert entities', async () => {
        const entities = Genre.fake().theGenres(2).build();

        await repository.bulkInsert(entities);

        expect(repository.items.length).toBe(2);
        expect(repository.items[0]).toBe(entities[0]);
        expect(repository.items[1]).toBe(entities[1]);
    });

    test('Should return all items', async () => {
        const entities = Genre.fake().theGenres(2).build();

        await repository.bulkInsert(entities);

        const allItems = await repository.findAll();

        expect(allItems.length).toBe(entities.length);
        expect(allItems).toStrictEqual(entities);
    });

    test('Should found an entity', async () => {
        const entityId = new GenreId();

        const entities = [Genre.fake().aGenre().withGenreId(entityId).build()];

        await repository.bulkInsert(entities);

        const foundItem = await repository.findById(entityId);

        expect(foundItem).toBe(entities[0]);
    });

    describe('Update an Entity', () => {
        test('Should return Exception when update entity not exist', async () => {
            const entity = Genre.fake().aGenre().build();

            await expect(repository.update(entity)).rejects.toThrow(
                new GenreNotFoundError(entity.genreId.value),
            );
        });

        test('Should update an entity', async () => {
            const entity = Genre.fake().aGenre().build();

            await repository.insert(entity);

            const entityUpdated = Genre.fake()
                .aGenre()
                .withGenreId(entity.genreId)
                .withName('Test updated')
                .build();

            await repository.update(entityUpdated);

            expect(entityUpdated.toJSON()).toStrictEqual(
                repository.items[0].toJSON(),
            );
        });
    });

    describe('Delete an Entity', () => {
        test('Should return Exception when entity not exist', async () => {
            const entityId = new GenreId();

            await expect(repository.delete(entityId)).rejects.toThrow(
                new GenreNotFoundError(entityId.value),
            );
        });

        test('Should update an entity', async () => {
            const entity = Genre.fake().aGenre().build();

            await repository.insert(entity);

            await repository.delete(entity.genreId);

            expect(repository.items).toHaveLength(0);
        });
    });

    describe('Filter items', () => {
        it('should no filter items when filter object is undefined', async () => {
            const items = [
                Genre.fake().aGenre().build(),
                Genre.fake().aGenre().build(),
            ];
            const filterSpy = jest.spyOn(items, 'filter' as any);

            const itemsFiltered = await repository['applyFilter'](
                items,
                undefined as any,
            );
            expect(filterSpy).not.toHaveBeenCalled();
            expect(itemsFiltered).toStrictEqual(items);
        });

        it('should no filter items when filter object is null', async () => {
            const items = [
                Genre.fake().aGenre().build(),
                Genre.fake().aGenre().build(),
            ];
            const filterSpy = jest.spyOn(items, 'filter' as any);

            const itemsFiltered = await repository['applyFilter'](
                items,
                null as any,
            );
            expect(filterSpy).not.toHaveBeenCalled();
            expect(itemsFiltered).toStrictEqual(items);
        });

        it('should filter items by name', async () => {
            const faker = Genre.fake();
            const items = [
                faker.aGenre().withName('test').build(),
                faker.aGenre().withName('TEST').build(),
                faker.aGenre().withName('fake').build(),
            ];
            const filterSpy = jest.spyOn(items, 'filter' as any);

            const itemsFiltered = await repository['applyFilter'](items, {
                name: 'TEST',
            });
            expect(filterSpy).toHaveBeenCalledTimes(1);
            expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
        });

        it('should filter items by categoriesId', async () => {
            const catId1 = new CategoryId();
            const catId2 = new CategoryId();
            const catId3 = new CategoryId();

            const faker = Genre.fake();
            const items = [
                faker.aGenre().addCategoryId(catId1).withName('test').build(),
                faker.aGenre().addCategoryId(catId2).withName('TEST').build(),
                faker.aGenre().addCategoryId(catId3).withName('fake').build(),
                faker
                    .aGenre()
                    .addCategoryId(catId1)
                    .addCategoryId(catId2)
                    .withName('genero')
                    .build(),
            ];

            const filterSpy = jest.spyOn(items, 'filter' as any);

            const itemsFiltered = await repository['applyFilter'](items, {
                categoriesId: [catId1],
            });
            expect(filterSpy).toHaveBeenCalledTimes(1);
            expect(itemsFiltered).toStrictEqual([items[0], items[3]]);
        });

        it('should filter items by name and categoriesId', async () => {
            const catId1 = new CategoryId();
            const catId2 = new CategoryId();
            const catId3 = new CategoryId();

            const faker = Genre.fake();
            const items = [
                faker.aGenre().addCategoryId(catId1).withName('test').build(),
                faker.aGenre().addCategoryId(catId2).withName('TEST').build(),
                faker.aGenre().addCategoryId(catId1).withName('genero').build(),
                faker
                    .aGenre()
                    .addCategoryId(catId3)
                    .addCategoryId(catId2)
                    .withName('fake')
                    .build(),
            ];

            const filterSpy = jest.spyOn(items, 'filter' as any);

            const itemsFiltered = await repository['applyFilter'](items, {
                name: 'fake',
                categoriesId: [catId2],
            });
            expect(filterSpy).toHaveBeenCalledTimes(1);
            expect(itemsFiltered).toStrictEqual([items[3]]);
        });

        it('should sort by createdAt when sort param is null', async () => {
            const items = [
                Genre.fake()
                    .aGenre()
                    .withName('test')
                    .withCreatedAt(new Date())
                    .build(),
                Genre.fake()
                    .aGenre()
                    .withName('TEST')
                    .withCreatedAt(new Date(new Date().getTime() + 1))
                    .build(),
                Genre.fake()
                    .aGenre()
                    .withName('fake')
                    .withCreatedAt(new Date(new Date().getTime() + 2))
                    .build(),
            ];

            const itemsSorted = await repository['applySorting'](
                items,
                null,
                null,
            );
            expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
        });

        it('should sort by name', async () => {
            const items = [
                Genre.fake().aGenre().withName('c').build(),
                Genre.fake().aGenre().withName('b').build(),
                Genre.fake().aGenre().withName('a').build(),
            ];

            let itemsSorted = await repository['applySorting'](
                items,
                'name',
                'asc',
            );
            expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);

            itemsSorted = await repository['applySorting'](
                items,
                'name',
                'desc',
            );
            expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
        });
    });
});
