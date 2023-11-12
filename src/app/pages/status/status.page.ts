import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Subscription } from 'rxjs';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { ActivatedRoute } from '@angular/router';
import { Status } from 'src/app/models/status';
import { Exif } from 'src/app/models/exif';
import { Location } from 'src/app/models/location';
import { StatusVisibility } from 'src/app/models/status-visibility';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { Responsive } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
    selector: 'app-status',
    templateUrl: './status.page.html',
    styleUrls: ['./status.page.scss'],
    animations: fadeInAnimation
})
export class StatusPage extends Responsive {
    readonly statusVisibility = StatusVisibility;
    isReady = false;

    status?: Status;
    mainStatus?: Status;
    routeParamsSubscription?: Subscription;

    constructor(
        private statusesService: StatusesService,
        private messageService: MessagesService,
        private authorizationService: AuthorizationService,
        private activatedRoute: ActivatedRoute,
        breakpointObserver: BreakpointObserver) {
            super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async params => {
            this.isReady = false;

            const statusId = params['id'] as string;
            await this.loadPageData(statusId);

            this.isReady = true;
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    isLoggedIn(): Boolean {
        return this.authorizationService.isLoggedIn();
    }

    getAltStatus(index: number): String | undefined {
        const attachment = this.mainStatus?.attachments?.at(index);
        if (attachment) {
            return attachment.description;
        }

        return undefined;        
    }

    getExif(index: number): Exif | undefined {
        const attachment = this.mainStatus?.attachments?.at(index);
        if (attachment) {
            return attachment.metadata?.exif;
        }

        return undefined;
    }

    getLocation(index: number): Location | undefined {
        const attachment = this.mainStatus?.attachments?.at(index);
        if (attachment) {
            return attachment.location;
        }

        return undefined;
    }

    getMapsUrl(index: number): String | undefined {
        const location = this.getLocation(index);
        if (location) {
            const latitude = location.latitude?.replace(',', '.');
            const longitude  = location.longitude?.replace(',', '.');
            
            return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=10/${latitude}/${longitude}`;
        }

        return undefined;
    }

    getCreatedAt(): Date | undefined {
        if (this.mainStatus?.createdAt) {
            return new Date(this.mainStatus.createdAt);
        }

        return undefined;
    }

    async reblog(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.reblog(this.mainStatus.id)
                this.messageService.showSuccess('Status boosted.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async unreblog(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.unreblog(this.mainStatus.id)
                this.messageService.showSuccess('Status unboosted.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async favourite(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.favourite(this.mainStatus.id)
                this.messageService.showSuccess('Status favourited.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async unfavourite(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.unfavourite(this.mainStatus.id)
                this.messageService.showSuccess('Status unfavorited.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async bookmark(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.bookmark(this.mainStatus.id)
                this.messageService.showSuccess('Status bookmarked.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async unbookmark(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.unbookmark(this.mainStatus.id)
                this.messageService.showSuccess('Status unbookmarked.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    private async loadPageData(statusId: string): Promise<void> {
        this.status = await this.statusesService.get(statusId)

        if (this.status.reblog) {
            this.mainStatus = this.status.reblog;
        } else {
            this.mainStatus = this.status;
        }
    }
}
