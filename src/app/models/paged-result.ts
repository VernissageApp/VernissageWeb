export class PagedResult<T>  {
    public page = 0;
    public size = 0;
    public total = 0;
    public data: T[] = [];
}
