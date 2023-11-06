import { StatusVisibility } from "./status-visibility";

export class ReblogRequest {
    public visibility: StatusVisibility

    constructor(visibility: StatusVisibility) {
        this.visibility = visibility;
    }
}
