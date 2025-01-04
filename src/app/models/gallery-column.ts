import { GalleryStatus } from "./gallery-status";

export class GalleryColumn {
    public columnId: number;
    public size = 0;
    public statuses: GalleryStatus[] = [];

    constructor(columnId: number) {
        this.columnId = columnId;
    }
}
