import { signal, WritableSignal } from "@angular/core";
import { Status } from "./status";

export class GalleryStatus {
    public status: Status;
    public contextIndex: number;
    public trackKey: string;
    public priority = false;
    public aspectRatio = '1 / 1';
    public inViewport: WritableSignal<boolean>;

    constructor(status: Status, contextIndex: number, priority: boolean, aspectRatio: string) {
        this.status = status;
        this.contextIndex = contextIndex;
        this.trackKey = `${status.id}:${contextIndex}`;
        this.priority = priority;
        this.aspectRatio = aspectRatio;
        this.inViewport = signal(priority);
    }
}
