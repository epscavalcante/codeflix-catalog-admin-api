import { instanceToPlain } from 'class-transformer';
import {
    CategoryCollectionPresenter,
    CategoryPresenter,
} from './categories.presenter';
import PaginationPresenter from '../shared/presenters/pagination.presenter';

describe('Category presenter', () => {
    test('Deve iniciar os valores normais', () => {
        const date = new Date();
        const categoryPresenter = new CategoryPresenter({
            id: '1234',
            name: 'Category',
            description: 'Opa',
            isActive: false,
            createdAt: date,
        });

        expect(categoryPresenter.id).toBe('1234');
        expect(categoryPresenter.name).toBe('Category');
        expect(categoryPresenter.description).toBe('Opa');
        expect(categoryPresenter.isActive).toBeFalsy;
        expect(categoryPresenter.createdAt).toBe(date);
    });

    test('Deve transformar os valores com string para inteiro', () => {
        const date = new Date();
        const categoryPresenter = new CategoryPresenter({
            id: '1234',
            name: 'Category',
            description: 'Opa',
            isActive: false,
            createdAt: date,
        });

        const categoryPresenterTransformed = instanceToPlain(categoryPresenter);

        expect(categoryPresenterTransformed.id).toBe('1234');
        expect(categoryPresenterTransformed.name).toBe('Category');
        expect(categoryPresenterTransformed.description).toBe('Opa');
        expect(categoryPresenterTransformed.isActive).toBeFalsy;
        expect(categoryPresenterTransformed.createdAt).toBe(date.toISOString());
    });

    test('Deve instanciar a paginationPresenter', () => {
        const date = new Date();

        const collectionPresenter = new CategoryCollectionPresenter({
            items: [
                {
                    id: '1234',
                    name: 'Category',
                    description: 'Opa',
                    isActive: false,
                    createdAt: date,
                },
            ],
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
            total: 5,
        });

        expect(collectionPresenter.paginationPresenter).toBeInstanceOf(
            PaginationPresenter,
        );
        expect(collectionPresenter.paginationPresenter.currentPage).toBe(1);
        expect(collectionPresenter.paginationPresenter.lastPage).toBe(2);
        expect(collectionPresenter.paginationPresenter.perPage).toBe(2);
        expect(collectionPresenter.paginationPresenter.total).toBe(5);
        expect(collectionPresenter.meta).toEqual(
            collectionPresenter.paginationPresenter,
        );
    });

    test('Deve transformar CollectionPresenter', () => {
        const date = new Date();

        const collectionPresenter = new CategoryCollectionPresenter({
            items: [
                {
                    id: '1234',
                    name: 'Category',
                    description: 'Opa',
                    isActive: false,
                    createdAt: date,
                },
            ],
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
            total: 5,
        });

        const collectionPresenterTransformed =
            instanceToPlain(collectionPresenter);

        expect(collectionPresenterTransformed).toStrictEqual({
            data: [
                {
                    id: '1234',
                    name: 'Category',
                    description: 'Opa',
                    isActive: false,
                    createdAt: date.toISOString(),
                },
            ],
            meta: {
                currentPage: 1,
                perPage: 2,
                lastPage: 2,
                total: 5,
            },
        });
    });
});
