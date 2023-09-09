import { v4 } from "uuid";
import EntityId from "../../../../shared/domain/value-objects/entity-id.vo";
import Category, { CategoryProps } from "../category"
import { omit } from "lodash";

describe('Category Unit Test', () => {

    test('deve alterar o nome', () => {
        const input: CategoryProps = { 
            name: 'Test',
        };

        const category = new Category(input);

        category.changeName('New name');

        expect(category.name).toBe('New name');
    })

    test('deve alterar a descrição', () => {
        const input: CategoryProps = { 
            name: 'Test',
        };

        const category = new Category(input);

        category.changeDescription('New description');

        expect(category.description).toBe('New description');
    })

    test('deve ativar uma categoria', () => {
        const input: CategoryProps = { 
            name: 'Test',
            isActive: false
        };

        const category = new Category(input);

        category.activate();

        expect(category.isActive).toBeTruthy();
    })

    test('deve desativar uma categoria', () => {
        const input: CategoryProps = { 
            name: 'Test',
            isActive: true
        };

        const category = new Category(input);

        category.deactivate();

        expect(category.isActive).toBeFalsy();
    })

    describe('Constructor props', () => {
        test('deve criar uma categoria com apenas nome', () => {
            const input: CategoryProps = { 
                name: 'Test',
            };
    
            const category = new Category(input);
    
            expect(category.categoryId).toBeDefined();
            expect(category.categoryId).toBeInstanceOf(EntityId);
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
            expect(category.categoryId).toBeInstanceOf(EntityId);
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
            expect(category.categoryId).toBeInstanceOf(EntityId);
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
            expect(category.categoryId).toBeInstanceOf(EntityId);
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
            expect(category.categoryId).toBeInstanceOf(EntityId);
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
    
            const category = Category.create(input);
    
            expect(category.categoryId).toBeDefined();
            expect(category.categoryId).toBeInstanceOf(EntityId);
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
    
            const category = Category.create(input);
    
            expect(category.categoryId).toBeDefined();
            expect(category.categoryId).toBeInstanceOf(EntityId);
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
    
            const category = Category.create(input);
    
            expect(category.categoryId).toBeDefined();
            expect(category.categoryId).toBeInstanceOf(EntityId);
            expect(category.name).toBe(input.name);
            expect(category.description).not.toBeNull();
            expect(category.description).toBe('My description');
            expect(category.isActive).toBeFalsy();
            expect(category.createdAt).not.toBeNull();
            expect(category.createdAt).toBeInstanceOf(Date);
        })
    });
    // test('deve criar uma categoria com nome e id', () => {
    //     const input: CategoryProps = { 
    //         name: 'Test',
    //     };

    //     const id = new EntityId(v4())

    //     const category = new Category(input, id);
    //     const props = omit(category.props, 'createdAt');

    //     expect(props).toStrictEqual({
    //         name: 'Test',
    //         isActive: true,
    //         description: undefined,
    //     });
    //     expect(category.props.createdAt).toBeInstanceOf(Date);
    //     expect(category.id).not.toBeNull();
    //     expect(category.id).toBeInstanceOf(EntityId);
    // })
});