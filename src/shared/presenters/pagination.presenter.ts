import { Transform } from 'class-transformer';

export type PaginationPresenterPropsType = {
    currentPage: number;
    perPage: number;
    lastPage: number;
    total: number;
};

export default class PaginationPresenter {
    @Transform(({ value }) => parseInt(value))
    currentPage: number;
    @Transform(({ value }) => parseInt(value))
    perPage: number;
    @Transform(({ value }) => parseInt(value))
    lastPage: number;
    @Transform(({ value }) => parseInt(value))
    total: number;

    constructor(props: PaginationPresenterPropsType) {
        this.currentPage = props.currentPage;
        this.perPage = props.perPage;
        this.lastPage = props.lastPage;
        this.total = props.total;
    }
}
