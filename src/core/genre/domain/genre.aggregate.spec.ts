import { CategoryId } from '@core/category/domain/category.aggregate';
import Genre, {
    GenreConstrutorProps,
    GenreStaticCreateProps,
} from './genre.aggregate';
import GenreId from './genre.id.vo';

beforeEach(() => {
    Genre.prototype.validate = jest
        .fn()
        .mockImplementation(Genre.prototype.validate);
});

describe('Genre Unit Test', () => {
    let genreValidationSpy: any;

    describe('Constructor props', () => {
        test('Deve instanciar um gênero pelo construtor com id manual', () => {
            const genreId = new GenreId();
            const categoryId = new CategoryId();
            const categoriesId = new Map([[categoryId.value, categoryId]]);
            const input: GenreConstrutorProps = {
                genreId: genreId,
                name: 'Test',
                categoriesId: categoriesId,
            };

            const genre = new Genre(input);

            expect(genre.genreId).toBeInstanceOf(GenreId);
            expect(genre.genreId.value).toBe(genreId.value);
            expect(genre.name).toBe(input.name);
            expect(genre.categoriesId).toBe(categoriesId);
            expect(genre.createdAt).toBeInstanceOf(Date);
        });

        test('Deve instanciar um gênero pelo construtor com ID automaático', () => {
            const categoryId = new CategoryId();
            const categoriesId = new Map([[categoryId.value, categoryId]]);
            const input: GenreConstrutorProps = {
                name: 'Test',
                categoriesId: categoriesId,
            };

            const genre = new Genre(input);

            expect(genre.genreId).toBeInstanceOf(GenreId);
            expect(genre.name).toBe(input.name);
            expect(genre.categoriesId).toBe(categoriesId);
            expect(genre.createdAt).toBeInstanceOf(Date);
        });
    });

    describe('Static command create', () => {
        test('Deve instanciar um gênero pelo static Create', () => {
            const categoryId = new CategoryId();
            const categoriesId = [categoryId];
            const input: GenreStaticCreateProps = {
                name: 'Test',
                categoriesId,
            };

            const genre = Genre.create(input);

            expect(genre.genreId).toBeInstanceOf(GenreId);
            expect(genre.name).toBe(input.name);
            expect(genre.categoriesId).toBeInstanceOf(Map);
            expect(genre.createdAt).toBeInstanceOf(Date);
        });
    });

    describe('Testes de invalidação do gênero', () => {
        describe('Invalidação do name', () => {
            test('Deve invalidar criação da gênero nome indefinido', () => {
                const input: GenreStaticCreateProps = {
                    // @ts-ignore
                    name: undefined,
                    categoriesId: [new CategoryId()],
                };

                const genre = Genre.create(input);

                expect(genre.notification.hasErrors()).toBeTruthy();
                expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);
                expect(genre.notification).notificationContainsErrorMessages([
                    {
                        name: [
                            'name must be shorter than or equal to 255 characters',
                            'name must be longer than or equal to 3 characters',
                        ],
                    },
                ]);
            });

            test('Deve invalidar criação da gênero sem nome', () => {
                const input: GenreStaticCreateProps = {
                    // @ts-ignore
                    name: null,
                    categoriesId: [new CategoryId()],
                };

                const genre = Genre.create(input);

                expect(genre.notification.hasErrors()).toBeTruthy();
                expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);
                expect(genre.notification).notificationContainsErrorMessages([
                    {
                        name: [
                            'name must be shorter than or equal to 255 characters',
                            'name must be longer than or equal to 3 characters',
                        ],
                    },
                ]);
            });

            test('Deve invalidar criação da gênero com nome vazio', () => {
                const input: GenreStaticCreateProps = {
                    name: '',
                    categoriesId: [new CategoryId()],
                };

                const genre = Genre.create(input);

                expect(genre.notification.hasErrors()).toBeTruthy();
                expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);
                expect(genre.notification).notificationContainsErrorMessages([
                    {
                        name: [
                            'name must be longer than or equal to 3 characters',
                        ],
                    },
                ]);
            });

            test('Deve invalidar criação do gênero com nome maior que 255 caracteres', () => {
                const input: GenreStaticCreateProps = {
                    name: 'a'.repeat(256),
                    categoriesId: [new CategoryId()],
                };

                const genre = Genre.create(input);

                expect(genre.notification.hasErrors()).toBeTruthy();
                expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);
                expect(genre.notification).notificationContainsErrorMessages([
                    {
                        name: [
                            'name must be shorter than or equal to 255 characters',
                        ],
                    },
                ]);
            });
        });
    });

    describe('Teste sobre categorias do gênero', () => {
        test('Deve adicionar um novo CategoryId', () => {

            const categoryId = new CategoryId();
            const categoriesId = new Map([[categoryId.value, categoryId]]);
            const input: GenreConstrutorProps = {
                name: 'Test',
                categoriesId: categoriesId,
            };
    
            const genre = new Genre(input);
    
            const newCategoryId = new CategoryId();
            genre.addCategoryId(newCategoryId);
    
            expect(genre.categoriesId).toBeInstanceOf(Map);
            expect(genre.categoriesId.size).toBe(2);
            expect(genre.toJSON()).toMatchObject({
                name: 'Test',
                categoriesId: [categoryId.value, newCategoryId.value]
            });
        });
    
        test('Deve remover um novo CategoryId', () => {
            const categoryId = new CategoryId();
            const categoryIdOne = new CategoryId();
            const categoriesId = new Map([
                [categoryId.value, categoryId],
                [categoryIdOne.value, categoryIdOne],
            ]);
            const input: GenreConstrutorProps = {
                name: 'Test',
                categoriesId: categoriesId,
            };
            
            const genre = new Genre(input);
    
            genre.removeCategoryId(categoryId);
    
            expect(genre.categoriesId).toBeInstanceOf(Map);
            expect(genre.categoriesId.size).toBe(1);
            expect(genre.toJSON()).toMatchObject({
                name: 'Test',
                categoriesId: [categoryIdOne.value]
            });
        });
    })
});
