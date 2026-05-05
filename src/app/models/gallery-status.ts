import { signal, WritableSignal } from "@angular/core";
import { Status } from "./status";

export class GalleryStatus {
    public status: Status;
    public trackKey: string;
    public priority = false;
    public aspectRatio = '1 / 1';
    public inViewport: WritableSignal<boolean>;

    constructor(status: Status, trackKey: string, priority: boolean, aspectRatio: string) {
        this.status = status;
        this.trackKey = trackKey;
        this.priority = priority;
        this.aspectRatio = aspectRatio;
        this.inViewport = signal(priority);
    }
}
