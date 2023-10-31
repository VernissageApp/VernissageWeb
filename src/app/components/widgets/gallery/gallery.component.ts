import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { Status } from 'src/app/models/status';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    animations: fadeInAnimation
})
export class GalleryComponent implements OnChanges {
    @Input() statuses?: Status[];

    gallery?: Status[][];
    readonly columns = 3;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.statuses) {
            this.buildGallery();
        }
    }

    private buildGallery(): void {
        this.gallery = [];

        for(let i = 0; i < this.columns; i++) {
            this.gallery?.push([]);
        }

        if (!this.statuses) {
            return;
        }

        let currentColumn = 0;
        for (let status of this.statuses) {
            this.gallery[currentColumn].push(status);
            currentColumn = (currentColumn + 1) % this.columns;
        }
    }

    getMainAttachmentSrc(status: Status): string {
        if (!status.attachments) {
            return '';
        }
    
        if (status.attachments?.length === 0) {
            return '';
        }
    
        return status.attachments[0].smallFile?.url ?? '';
    }
}
