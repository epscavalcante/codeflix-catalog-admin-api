import { Chance } from 'chance';
import GenreFactory from './genre.factory';
import GenreId from './genre.id.vo';
import { CategoryId } from '@core/category/domain/category.aggregate';

describe('GenreFactory Unit Tests', () => {
    describe('genreId prop', () => {
        const faker = GenreFactory.aGenre();

        test('should throw error when any with methods has called', () => {
            expect(() => faker.genreId).toThrowError(
                new Error(
                    "Property genreId not have a factory, use 'with' methods",
                ),
            );
        });

        test('should be undefined', () => {
            expect(faker['_genreId']).toBeUndefined();
        });

        test('withGenreId', () => {
            const genreId = new GenreId();
            const $this = faker.withGenreId(genreId);
            expect($this).toBeInstanceOf(GenreFactory);
            expect(faker['_genreId']).toBe(genreId);

            faker.withGenreId(() => genreId);
            //@ts-expect-error _genreId is a callable
            expect(faker['_genreId']()).toBe(genreId);

            expect(faker.genreId).toBe(genreId);
        });

        //TODO - melhorar este nome
        test('should pass index to genreId factory', () => {
            let mockFactory = jest.fn(() => new GenreId());
            faker.withGenreId(mockFactory);
            faker.build();
            expect(mockFactory).toHaveBeenCalledTimes(1);

            const genreId = new GenreId();
            mockFactory = jest.fn(() => genreId);
            const fakerMany = GenreFactory.theGenres(2);
            fakerMany.withGenreId(mockFactory);
            fakerMany.build();

            expect(mockFactory).toHaveBeenCalledTimes(2);
            expect(fakerMany.build()[0].genreId).toBe(genreId);
            expect(fakerMany.build()[1].genreId).toBe(genreId);
        });
    });

    describe('name prop', () => {
        const faker = GenreFactory.aGenre();
        test('should be a function', () => {
            expect(typeof faker['_name']).toBe('function');
        });

        test('should call the word method', () => {
            const chance = Chance();
            const spyWordMethod = jest.spyOn(chance, 'word');
            faker['chance'] = chance;
            faker.build();

            expect(spyWordMethod).toHaveBeenCalled();
        });

        test('withName', () => {
            const $this = faker.withName('test name');
            expect($this).toBeInstanceOf(GenreFactory);
            expect(faker['_name']).toBe('test name');

            faker.withName(() => 'test name');
            //@ts-expect-error name is callable
            expect(faker['_name']()).toBe('test name');

            expect(faker.name).toBe('test name');
        });

        test('should pass index to name factory', () => {
            faker.withName((index) => `test name ${index}`);
            const genre = faker.build();
            expect(genre.name).toBe(`test name 0`);

            const fakerMany = GenreFactory.theGenres(2);
            fakerMany.withName((index) => `test name ${index}`);
            const genres = fakerMany.build();

            expect(genres[0].name).toBe(`test name 0`);
            expect(genres[1].name).toBe(`test name 1`);
        });

        test('invalid too long case', () => {
            const $this = faker.withInvalidNameTooLong();
            expect($this).toBeInstanceOf(GenreFactory);
            expect(faker['_name'].length).toBe(256);

            const tooLong = 'a'.repeat(256);
            faker.withInvalidNameTooLong(tooLong);
            expect(faker['_name'].length).toBe(256);
            expect(faker['_name']).toBe(tooLong);
        });
    });

    describe('createdAt prop', () => {
        const faker = GenreFactory.aGenre();

        test('should throw error when any with methods has called', () => {
            const fakerGenre = GenreFactory.aGenre();
            expect(() => fakerGenre.createdAt).toThrowError(
                new Error(
                    "Property createdAt not have a factory, use 'with' methods",
                ),
            );
        });

        test('should be undefined', () => {
            expect(faker['_createdAt']).toBeUndefined();
        });

        test('withCreatedAt', () => {
            const date = new Date();
            const $this = faker.withCreatedAt(date);
            expect($this).toBeInstanceOf(GenreFactory);
            expect(faker['_createdAt']).toBe(date);

            faker.withCreatedAt(() => date);
            //@ts-expect-error _createdAt is a callable
            expect(faker['_createdAt']()).toBe(date);
            expect(faker.createdAt).toBe(date);
        });

        test('should pass index to createdAt factory', () => {
            const date = new Date();
            faker.withCreatedAt(
                (index) => new Date(date.getTime() + index + 2),
            );
            const genre = faker.build();
            expect(genre.createdAt.getTime()).toBe(date.getTime() + 2);

            const fakerMany = GenreFactory.theGenres(2);
            fakerMany.withCreatedAt(
                (index) => new Date(date.getTime() + index + 2),
            );
            const genres = fakerMany.build();

            expect(genres[0].createdAt.getTime()).toBe(date.getTime() + 2);
            expect(genres[1].createdAt.getTime()).toBe(date.getTime() + 3);
        });
    });

    test('should create a genre', () => {
        const faker = GenreFactory.aGenre();
        let genre = faker.build();

        expect(genre.genreId).toBeInstanceOf(GenreId);
        expect(typeof genre.name === 'string').toBeTruthy();
        expect(genre.createdAt).toBeInstanceOf(Date);

        const createdAt = new Date();
        const genreId = new GenreId();
        genre = faker
            .withGenreId(genreId)
            .withName('name test')
            .withCreatedAt(createdAt)
            .build();

        expect(genre.genreId.value).toBe(genreId.value);
        expect(genre.name).toBe('name test');
        expect(genre.createdAt).toBe(createdAt);
    });

    test('should create many genres', () => {
        const faker = GenreFactory.theGenres(2);
        let genres = faker.build();

        genres.forEach((genre) => {
            expect(genre.genreId).toBeInstanceOf(GenreId);
            expect(typeof genre.name === 'string').toBeTruthy();
            expect(genre.createdAt).toBeInstanceOf(Date);
        });

        const createdAt = new Date();
        const genreId = new GenreId();
        genres = faker
            .withGenreId(genreId)
            .withName('name test')
            .withCreatedAt(createdAt)
            .build();

        genres.forEach((genre) => {
            expect(genre.genreId.value).toBe(genreId.value);
            expect(genre.name).toBe('name test');
            expect(genre.createdAt).toBe(createdAt);
        });
    });

    test('should Create genre with CategoriesId', () => {
        const categoryId = new CategoryId();
        const genre = GenreFactory.aGenre().addCategoryId(categoryId).build();
        expect(genre.genreId).toBeInstanceOf(GenreId);
        expect(genre.categoriesId).toBeInstanceOf(Map);
        expect(genre.categoriesId.size).toBe(1);
        expect(genre.categoriesId).toMatchObject(
            new Map([[categoryId.value, categoryId]]),
        );
    });
});
