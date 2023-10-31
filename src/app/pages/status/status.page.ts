import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Subscription } from 'rxjs';
import { PageNotFoundError } from 'src/app/errors/page-not-found-error';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { ActivatedRoute } from '@angular/router';
import { Status } from 'src/app/models/status';
import { Exif } from 'src/app/models/exif';

@Component({
    selector: 'app-status',
    templateUrl: './status.page.html',
    styleUrls: ['./status.page.scss'],
    animations: fadeInAnimation
})
export class StatusPage implements OnInit, OnDestroy {
    isReady = false;

    status?: Status;
    routeParamsSubscription?: Subscription;

    constructor(
        private statusesService: StatusesService,
        private activatedRoute: ActivatedRoute) {
    }

    async ngOnInit(): Promise<void> {
        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async params => {
            this.isReady = false;

            const statusId = params['id'] as string;
            await this.loadPageData(statusId);

            this.isReady = true;
        });
    }

    ngOnDestroy(): void {
        this.routeParamsSubscription?.unsubscribe();
    }

    getExif(index: number): Exif | undefined {
        const attachment = this.status?.attachments?.at(index);
        if (attachment) {
            return attachment.metadata?.exif;
        }

        return undefined;
    }

    private async loadPageData(statusId: string): Promise<void> {
        this.status = await this.statusesService.get(statusId)
    }
}
