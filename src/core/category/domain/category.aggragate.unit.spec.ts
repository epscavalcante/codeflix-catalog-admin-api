import Uuid from '../../shared/domain/value-objects/uuid.vo';
import Category, { CategoryProps } from './category.aggregate';

describe('Category Unit Test', () => {
    let categoryValidationSpy: any;

    describe('Without validation entity', () => {
        beforeEach(() => {
            Category.prototype.validate = jest
                .fn()
                .mockImplementation(Category.prototype.validate);
        });

        test('deve alterar o nome', () => {
            const input: CategoryProps = {
                name: 'Test',
            };

            const category = new Category(input);

            category.changeName('New name');

            expect(category.name).toBe('New name');
            // expect(categoryValidationSpy).toBeCalledTimes(1);
        });

        test('deve alterar a descrição', () => {
            const input: CategoryProps = {
                name: 'Test',
            };

            const category = new Category(input);

            category.changeDescription('New description');

            expect(category.description).toBe('New description');
            // expect(categoryValidationSpy).toBeCalledTimes(1);
        });

        test('deve ativar uma categoria', () => {
            const input: CategoryProps = {
                name: 'Test',
                isActive: false,
            };

            const category = new Category(input);

            category.activate();

            expect(category.isActive).toBeTruthy();
            // expect(categoryValidationSpy).toBeCalledTimes(1);
        });

        test('deve desativar uma categoria', () => {
            const input: CategoryProps = {
                name: 'Test',
                isActive: true,
            };

            const category = new Category(input);

            category.deactivate();

            expect(category.isActive).toBeFalsy();
            // expect(categoryValidationSpy).toBeCalledTimes(1);
        });

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
            });

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
            });

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
            });

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
            });
        });
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
            expect(Category.prototype.validate).toBeCalledTimes(1);
            expect(category.notification.hasErrors()).toBeFalsy();
        });

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
            expect(Category.prototype.validate).toBeCalledTimes(1);
            expect(category.notification.hasErrors()).toBeFalsy();

            category.changeName('Other');

            expect(category.name).toBe('Other');
            expect(Category.prototype.validate).toBeCalledTimes(2);
            expect(category.notification.hasErrors()).toBeFalsy();
        });

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
            expect(Category.prototype.validate).toBeCalledTimes(1);
            expect(category.notification.hasErrors()).toBeFalsy();
        });

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
            expect(Category.prototype.validate).toBeCalledTimes(1);
            expect(category.notification.hasErrors()).toBeFalsy();
        });

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
            expect(Category.prototype.validate).toBeCalledTimes(1);
            expect(category.notification.hasErrors()).toBeFalsy();
        });
    });

    describe('Testes de invalidação na categoria', () => {
        describe('Invalidação do name', () => {
            test('Deve invalidar criação da categoria sem nome', () => {
                const input: CategoryProps = {
                    // @ts-ignore
                    name: null,
                };

                const category = Category.create(input);

                expect(category.notification.hasErrors()).toBeTruthy();
                expect(category.notification).notificationContainsErrorMessages(
                    [
                        {
                            name: [
                                'name must be shorter than or equal to 255 characters',
                                'name must be longer than or equal to 3 characters',
                            ],
                        },
                    ],
                );
            });

            test('Deve invalidar criação da categoria com nome vazio', () => {
                const input: CategoryProps = {
                    name: '',
                };

                const category = Category.create(input);

                expect(category.notification.hasErrors()).toBeTruthy();
                expect(category.notification).notificationContainsErrorMessages(
                    [
                        {
                            name: [
                                'name must be longer than or equal to 3 characters',
                            ],
                        },
                    ],
                );
            });

            test('Deve invalidar criação da categoria com nome maior que 255 caracteres', () => {
                const input: CategoryProps = {
                    name: 'a'.repeat(256),
                };

                const category = Category.create(input);

                expect(category.notification.hasErrors()).toBeTruthy();
                expect(category.notification).notificationContainsErrorMessages(
                    [
                        {
                            name: [
                                'name must be shorter than or equal to 255 characters',
                            ],
                        },
                    ],
                );
            });
        });
    });
});
