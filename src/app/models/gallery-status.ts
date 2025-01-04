import { Status } from "./status";

export class GalleryStatus {
    public status: Status;
    public priority = false;

    constructor(status: Status, priority: boolean) {
        this.status = status;
        this.priority = priority;
    }
}
