import { LinkableResult } from "./linkable-result";
import { Status } from "./status";

export class CategoryStatuses {
    public id: string;
    public name: string;
    public statuses: LinkableResult<Status>;

    constructor(id: string, name: string, statuses: LinkableResult<Status>) {
        this.id = id;
        this.name = name;
        this.statuses = statuses;
    }
}
