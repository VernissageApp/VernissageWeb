import { Status } from "./status";

export class StatusComment {
    public status: Status;
    public showDivider = false;

    constructor(status: Status, showDivider: boolean) {
        this.status = status;
        this.showDivider = showDivider;
    }
}
