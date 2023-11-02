import { Exclude, Expose } from 'class-transformer';
import PaginationPresenter, {
    PaginationPresenterPropsType,
} from './pagination.presenter';

export default abstract class CollectionPresenter {
    @Exclude()
    paginationPresenter: PaginationPresenter;

    constructor(props: PaginationPresenterPropsType) {
        this.paginationPresenter = new PaginationPresenter(props);
    }

    @Expose({ name: 'meta' })
    get meta() {
        return this.paginationPresenter;
    }

    abstract get data();
}
