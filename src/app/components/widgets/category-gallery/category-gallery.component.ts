import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { Responsive } from 'src/app/common/responsive';
import { Attachment } from 'src/app/models/attachment';
import { Category } from 'src/app/models/category';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';

@Component({
    selector: 'app-category-gallery',
    templateUrl: './category-gallery.component.html',
    styleUrls: ['./category-gallery.component.scss'],
    animations: fadeInAnimation
})
export class CategoryGalleryComponent extends Responsive {
    @Input() categories?: Category[];
    @Input() categoryStatuses?: Map<string, LinkableResult<Status>>;

    constructor(
        private contextStatusesService: ContextStatusesService,
        breakpointObserver: BreakpointObserver) {
            super(breakpointObserver);
    }

    getStatuses(userName: string | undefined): Status[] {
        if (!userName) {
            return [];
        }

        return this.getLinkableStatuses(userName)?.data ?? [];
    }

    getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    getMainAttachmentSrc(status: Status): string {
        const mainAttachment = this.getMainAttachment(status);
        return mainAttachment?.smallFile?.url ?? '';
    }

    getMainAttachmentBlurhash(status: Status): string {
        const mainAttachment = this.getMainAttachment(status);
        return mainAttachment?.blurhash ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
    }

    onStatusClick(hashtag: string | undefined): void {
        let statuses = this.getLinkableStatuses(hashtag);
        this.contextStatusesService.setContextStatuses(statuses);
    }

    private getLinkableStatuses(category: string | undefined): LinkableResult<Status> | undefined {
        if (!category) {
            return undefined;
        }

        return this.categoryStatuses?.get(category) ?? undefined;
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
