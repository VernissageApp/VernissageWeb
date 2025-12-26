import { signal, WritableSignal } from "@angular/core";
import { Status } from "./status";

export class GalleryStatus {
    public status: Status;
    public priority = false;
    public aspectRatio = '1 / 1';
    public inViewport: WritableSignal<boolean>;

    constructor(status: Status, priority: boolean, aspectRatio: string) {
        this.status = status;
        this.priority = priority;
        this.aspectRatio = aspectRatio;
        this.inViewport = signal(priority);
    }
}
