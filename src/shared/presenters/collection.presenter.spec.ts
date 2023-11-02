import { instanceToPlain } from 'class-transformer';
import CollectionPresenter from './collection.presenter';
import PaginationPresenter from './pagination.presenter';

class StubCollectionPresenter extends CollectionPresenter {
    data = [1, 2, 3];
}

describe('CollectionPresenter', () => {
    test('Deve instanciar a paginationPresenter', () => {
        const collectionPresenter = new StubCollectionPresenter({
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
        expect(collectionPresenter.meta).toEqual(collectionPresenter.paginationPresenter);
    });


    test('Deve transformar CollectionPresenter', () => {
        const collectionPresenter = new StubCollectionPresenter({
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
            total: 5,
        });

        const collectionPresenterTransformed = instanceToPlain(collectionPresenter);

        expect(collectionPresenterTransformed).toStrictEqual({
            data: [1,2,3],
            meta: {
                currentPage: 1,
                perPage: 2,
                lastPage:2,
                total: 5
            }
        });
    });
});
