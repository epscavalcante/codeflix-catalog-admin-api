import { instanceToPlain } from 'class-transformer';
import PaginationPresenter from './pagination.presenter';

describe('Pagination presenter', () => {
    describe('Construtor', () => {
        test('Deve iniciar os valores com números', () => {
            const paginationPresenter = new PaginationPresenter({
                currentPage: 1,
                lastPage: 3,
                perPage: 2,
                total: 10,
            });

            expect(paginationPresenter.currentPage).toBe(1);
            expect(paginationPresenter.lastPage).toBe(3);
            expect(paginationPresenter.perPage).toBe(2);
            expect(paginationPresenter.total).toBe(10);
        });

        test('Deve iniciar os valores com string', () => {
            const paginationPresenter = new PaginationPresenter({
                currentPage: '1' as any,
                lastPage: '3' as any,
                perPage: '2' as any,
                total: '10' as any,
            });

            expect(paginationPresenter.currentPage).toBe('1');
            expect(paginationPresenter.lastPage).toBe('3');
            expect(paginationPresenter.perPage).toBe('2');
            expect(paginationPresenter.total).toBe('10');
        });
    });

    describe('Transform values NESTJS', () => {
        test('Deve transformar os valores com números para inteiros', () => {
            const paginationPresenter = new PaginationPresenter({
                currentPage: 1,
                lastPage: 3,
                perPage: 2,
                total: 10,
            });

            const paginationPresenterTransformed =
                instanceToPlain(paginationPresenter);

            expect(paginationPresenterTransformed).toStrictEqual({
                currentPage: 1,
                lastPage: 3,
                perPage: 2,
                total: 10,
            });
        });

        test('Deve transformar os valores com string para inteiro', () => {
            const paginationPresenter = new PaginationPresenter({
                currentPage: '1' as any,
                lastPage: '3' as any,
                perPage: '2' as any,
                total: '10' as any,
            });

            const paginationPresenterTransformed =
                instanceToPlain(paginationPresenter);

            expect(paginationPresenterTransformed).toStrictEqual({
                currentPage: 1,
                lastPage: 3,
                perPage: 2,
                total: 10,
            });
        });
    });
});
