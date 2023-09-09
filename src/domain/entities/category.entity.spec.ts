import Uuid from "../value-objects/uuid.vo";
import Category, { CategoryProps } from "./category.entity";

describe('Category Unit Test', () => {
    let categoryValidationSpy: any;

    beforeEach(() => {
        categoryValidationSpy = jest.spyOn(Category, "validate");
    });

    test('deve alterar o nome', () => {
        const input: CategoryProps = { 
            name: 'Test',
        };

        const category = new Category(input);

        category.changeName('New name');

        expect(category.name).toBe('New name');
        expect(categoryValidationSpy).toBeCalledTimes(1);
    })

    test('deve alterar a descrição', () => {
        const input: CategoryProps = { 
            name: 'Test',
        };

        const category = new Category(input);

        category.changeDescription('New description');

        expect(category.description).toBe('New description');
        expect(categoryValidationSpy).toBeCalledTimes(1);
    })

    test('deve ativar uma categoria', () => {
        const input: CategoryProps = { 
            name: 'Test',
            isActive: false
        };

        const category = new Category(input);

        category.activate();

        expect(category.isActive).toBeTruthy();
        expect(categoryValidationSpy).toBeCalledTimes(1);
    })

    test('deve desativar uma categoria', () => {
        const input: CategoryProps = { 
            name: 'Test',
            isActive: true
        };

        const category = new Category(input);

        category.deactivate();

        expect(category.isActive).toBeFalsy();
        expect(categoryValidationSpy).toBeCalledTimes(1);
    })

    describe('Constructor props', () => {
        test('deve criar uma categoria com apenas nome', () => {
            const input: CategoryProps = { 
                name: 'Test',
            };
    
            const category = new Category(input);
    
            expect(category.categoryId).toBeDefined();
            expect(category.categoryId).toBeInstanceOf(Uuid);
            expect(category.name).toBe('Test');
            expect(category.description).toBeNull();
            expect(category.isActive).toBeTruthy();
            expect(category.createdAt).not.toBeNull();
            expect(category.createdAt).toBeInstanceOf(Date);
        })
    
        test('deve criar uma categoria com nome e desabilitada', () => {
            const input: CategoryProps = { 
                name: 'Test',
                isActive: false,
            };
    
            const category = new Category(input);
    
            expect(category.categoryId).toBeDefined();
            expect(category.categoryId).toBeInstanceOf(Uuid);
            expect(category.name).toBe('Test');
            expect(category.description).toBeNull();
            expect(category.isActive).toBeFalsy();
            expect(category.createdAt).not.toBeNull();
            expect(category.createdAt).toBeInstanceOf(Date);
        })
    
        test('deve criar uma categoria com nome e descrição', () => {
            const input: CategoryProps = { 
                name: 'Test',
                description: 'My description',
            };
    
            const category = new Category(input);
    
            expect(category.categoryId).toBeDefined();
            expect(category.categoryId).toBeInstanceOf(Uuid);
            expect(category.name).toBe(input.name);
            expect(category.description).not.toBeNull();
            expect(category.description).toBe('My description');
            expect(category.isActive).toBeTruthy();
            expect(category.createdAt).not.toBeNull();
            expect(category.createdAt).toBeInstanceOf(Date);
        })
    
        test('deve criar uma categoria com nome, descrição e desabilitada', () => {
            const input: CategoryProps = { 
                name: 'Test',
                description: 'My description',
                isActive: false,
            };
    
            const category = new Category(input);
    
            expect(category.categoryId).toBeDefined();
            expect(category.categoryId).toBeInstanceOf(Uuid);
            expect(category.name).toBe(input.name);
            expect(category.description).not.toBeNull();
            expect(category.description).toBe('My description');
            expect(category.isActive).toBeFalsy();
            expect(category.createdAt).not.toBeNull();
            expect(category.createdAt).toBeInstanceOf(Date);
        })
    });

    describe('Static command create', () => {
        test('deve criar uma categoria com apenas nome', () => {
            const input: CategoryProps = { 
                name: 'Test',
            };
    
            const category = Category.create(input);
    
            expect(category.categoryId).toBeDefined();
            expect(category.categoryId).toBeInstanceOf(Uuid);
            expect(category.name).toBe('Test');
            expect(category.description).toBeNull();
            expect(category.isActive).toBeTruthy();
            expect(category.createdAt).not.toBeNull();
            expect(category.createdAt).toBeInstanceOf(Date);
            expect(categoryValidationSpy).toBeCalledTimes(1);
        })

        test('deve criar uma categoria com apenas nome e alterar o nome', () => {
            const input: CategoryProps = { 
                name: 'Test',
            };
    
            const category = Category.create(input);
    
            expect(category.categoryId).toBeDefined();
            expect(category.categoryId).toBeInstanceOf(Uuid);
            expect(category.name).toBe('Test');
            expect(category.description).toBeNull();
            expect(category.isActive).toBeTruthy();
            expect(category.createdAt).not.toBeNull();
            expect(category.createdAt).toBeInstanceOf(Date);

            category.changeName('Other');

            expect(category.name).toBe('Other');

            expect(categoryValidationSpy).toBeCalledTimes(2);
        })

        test('deve criar uma categoria com nome e desabilitada', () => {
            const input: CategoryProps = { 
                name: 'Test',
                isActive: false,
            };
    
            const category = Category.create(input);
    
            expect(category.categoryId).toBeDefined();
            expect(category.categoryId).toBeInstanceOf(Uuid);
            expect(category.name).toBe('Test');
            expect(category.description).toBeNull();
            expect(category.isActive).toBeFalsy();
            expect(category.createdAt).not.toBeNull();
            expect(category.createdAt).toBeInstanceOf(Date);
            expect(categoryValidationSpy).toBeCalledTimes(1);
        })
    
        test('deve criar uma categoria com nome e descrição', () => {
            const input: CategoryProps = { 
                name: 'Test',
                description: 'My description',
            };
    
            const category = Category.create(input);
    
            expect(category.categoryId).toBeDefined();
            expect(category.categoryId).toBeInstanceOf(Uuid);
            expect(category.name).toBe(input.name);
            expect(category.description).not.toBeNull();
            expect(category.description).toBe('My description');
            expect(category.isActive).toBeTruthy();
            expect(category.createdAt).not.toBeNull();
            expect(category.createdAt).toBeInstanceOf(Date);
            expect(categoryValidationSpy).toBeCalledTimes(1);
        })
    
        test('deve criar uma categoria com nome, descrição e desabilitada', () => {
            const input: CategoryProps = { 
                name: 'Test',
                description: 'My description',
                isActive: false,
            };
    
            const category = Category.create(input);
    
            expect(category.categoryId).toBeDefined();
            expect(category.categoryId).toBeInstanceOf(Uuid);
            expect(category.name).toBe(input.name);
            expect(category.description).not.toBeNull();
            expect(category.description).toBe('My description');
            expect(category.isActive).toBeFalsy();
            expect(category.createdAt).not.toBeNull();
            expect(category.createdAt).toBeInstanceOf(Date);
            expect(categoryValidationSpy).toBeCalledTimes(1);
        })
    });

    describe('Testes de invalidação na categoria', () => {
        test('Deve invalidar criação da categoria sem nome', () => {
            const input: CategoryProps = {
                name: null
            }

            expect(() => Category.create(input)).containsErrorMessage({
                name: [
                    'name must be shorter than or equal to 255 characters',
                    'name must be a string',
                    'name should not be empty',
                ]
            });
        });

        test('Deve invalidar criação da categoria com nome vazio', () => {
            const input: CategoryProps = {
                name: ''
            }

            expect(() => Category.create(input)).containsErrorMessage({
                name: [
                    'name should not be empty',
                ]
            });
        });

        test('Deve invalidar criação da categoria com nome maior que 255 caracteres', () => {
            const input: CategoryProps = {
                name: 'a'.repeat(256)
            }

            expect(() => Category.create(input)).containsErrorMessage({
                name: [
                    'name must be shorter than or equal to 255 characters'
                ]
            });
        });

        test('Deve invalidar criação da categoria informando nome como número', () => {
            const input: CategoryProps = {
                name: 1 as any
            }

            expect(() => Category.create(input)).containsErrorMessage({
                name: [
                    "name must be shorter than or equal to 255 characters",
                    "name must be a string",
                ]
            });
        });

        test('Deve invalidar criação da categoria informando descrição maior que 255 caracteres', () => {
            const input: CategoryProps = {
                name: 'Categoria',
                description: "C".repeat(256)
            }

            expect(() => Category.create(input)).containsErrorMessage({
                description: [
                    "description must be shorter than or equal to 255 characters"
                ]
            });
        });

        test('Deve invalidar criação da categoria informando descrição como número', () => {
            const input: CategoryProps = {
                name: 'Categoria',
                description: 2 as any
            }

            expect(() => Category.create(input)).containsErrorMessage({
                description: [
                    "description must be shorter than or equal to 255 characters",
                    "description must be a string",
                ]
            });
        });

        test('Deve invalidar criação da categoria informando isActive como número', () => {
            const input: CategoryProps = {
                name: 'Categoria',
                isActive: 2 as any
            }

            expect(() => Category.create(input)).containsErrorMessage({
                isActive: [
                    "isActive must be a boolean value",
                ]
            });
        });

        test('Deve invalidar criação da categoria informando isActive booleano como número 0 | 1', () => {
            const input: CategoryProps = {
                name: 'Categoria',
                isActive: 1 as any
            }

            expect(() => Category.create(input)).containsErrorMessage({
                isActive: [
                    "isActive must be a boolean value",
                ]
            });
        });

        test('Deve invalidar criação da categoria informando isActive booleano como número 0 | 1', () => {
            const input: CategoryProps = {
                name: 'Categoria',
                isActive: 0 as any
            }

            expect(() => Category.create(input)).containsErrorMessage({
                isActive: [
                    "isActive must be a boolean value",
                ]
            });
        });
    });
});