import Entity from "../entities/entity";
import ValueObject from "../value-objects/value-object";
import IRepository from "./repository.interface";

export default interface ISearchableRepository<
    E extends Entity, 
    EntityId extends ValueObject,
    Filter = string,
    SearchInput = SearchParams<Filter>,
    SearchOutput = SearchResult
> extends IRepository<E, EntityId> {
    sortableFields: string[];
    search(props: SearchInput): Promise<SearchOutput>
}

export type SortDirection = 'asc' | 'desc';

export type SearchParamsConstructorProps<Filter = string> = {
  page?: number;
  perPage?: number;
  sort?: string | null;
  sortDir?: SortDirection | null;
  filter?: Filter | null;
};

type SearchResultConstructorProps<E extends Entity> = {
    items: E[];
    total: number;
    currentPage: number;
    perPage: number;
  };

export class SearchParams<Filter = string> extends ValueObject {
  protected _page: number;
  protected _perPage: number = 15;
  protected _sort: string | null;
  protected _sortDir: SortDirection | null;
  protected _filter?: Filter | null;

  constructor(props: SearchParamsConstructorProps<Filter> = {}) {
    super();
    this.page = props.page!;
    this.perPage = props.perPage!;
    this.sort = props.sort!;
    this.sortDir = props.sortDir!;
    this.filter = props.filter!;
  }

  get page() {
    return this._page;
  }

  private set page(value: number) {
    let _page = +value;

    if (Number.isNaN(_page) || _page <= 0 || parseInt(_page as any) !== _page) {
      _page = 1;
    }

    this._page = _page;
  }

  get perPage() {
    return this._perPage;
  }

  private set perPage(value: number) {
    let _perPage = value === (true as any) ? this._perPage : +value;

    if (
      Number.isNaN(_perPage) ||
      _perPage <= 0 ||
      parseInt(_perPage as any) !== _perPage
    ) {
      _perPage = this._perPage;
    }

    this._perPage = _perPage;
  }

  get sort(): string | null {
    return this._sort;
  }

  private set sort(value: string | null) {
    this._sort =
      value === null || value === undefined || value === '' ? null : `${value}`;
  }

  get sortDir(): SortDirection | null {
    return this._sortDir;
  }

  private set sortDir(value: SortDirection | null) {
    if (!this.sort) {
      this._sortDir = null;
      return;
    }
    const dir = `${value}`.toLowerCase();
    this._sortDir = dir !== 'asc' && dir !== 'desc' ? 'asc' : dir;
  }

  get filter(): Filter | null {
    return this._filter || null;
  }

  protected set filter(value: Filter | null) {
    this._filter =
      value === null || value === undefined || (value as unknown) === ''
        ? null
        : (`${value}` as any);
  }
}

export class SearchResult<E extends Entity = Entity> extends ValueObject {
    readonly items: E[];
    readonly total: number;
    readonly currentPage: number;
    readonly perPage: number;
    readonly lastPage: number;
  
    constructor(props: SearchResultConstructorProps<E>) {
      super();
      this.items = props.items;
      this.total = props.total;
      this.currentPage = props.currentPage;
      this.perPage = props.perPage;
      this.lastPage = Math.ceil(this.total / this.perPage);
    }
  
    toJSON(forceEntity = false) {
      return {
        items: forceEntity
          ? this.items.map((item) => item.toJSON())
          : this.items,
        total: this.total,
        currentPage: this.currentPage,
        perPage: this.perPage,
        lastPage: this.lastPage,
      };
    }
}
