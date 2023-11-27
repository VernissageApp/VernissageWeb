import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { Attachment } from 'src/app/models/attachment';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    animations: fadeInAnimation
})
export class GalleryComponent implements OnInit, OnChanges {
    @Input() statuses?: LinkableResult<Status>;

    gallery?: Status[][];
    columns = 3;

    isHandset = false;
    breakpointSubscription?: Subscription;

    constructor(
        private contextStatusesService: ContextStatusesService,
        private breakpointObserver: BreakpointObserver) {
    }

    ngOnInit(): void {
        this.breakpointSubscription = this.breakpointObserver.observe([
            Breakpoints.XSmall, Breakpoints.Small
        ]).subscribe(result => {
            console.log('rrrrr');

            if (result.matches) {
                this.isHandset = true;
                this.columns = 1;
                this.buildGallery();
            } else {
                this.isHandset = false;
                this.columns = 3;
                this.buildGallery();
            }
        });
    }    

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.statuses) {
            this.contextStatusesService.setContextStatuses(this.statuses);
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
        for (let status of this.statuses.data) {
            this.gallery[currentColumn].push(status);
            currentColumn = (currentColumn + 1) % this.columns;
        }
    }

    getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    getMainAttachmentSrc(status: Status): string {
        const mainAttachment = this.getMainAttachment(status);
        return mainAttachment?.smallFile?.url ?? '';
    }

    getMainAttachmentAlt(status: Status): string | undefined {
        const mainAttachment = this.getMainAttachment(status);
        return mainAttachment?.description;
    }

    getMainAttachmentBlurhash(status: Status): string {
        const mainAttachment = this.getMainAttachment(status);
        return mainAttachment?.blurhash ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
    }

    private getMainAttachment(status: Status): Attachment | null {
        const mainStatus = status.reblog ?? status;

        if (!mainStatus.attachments) {
            return null;
        }
    
        if (mainStatus.attachments?.length === 0) {
            return null;
        }
    
        return mainStatus.attachments[0]
    }
}
