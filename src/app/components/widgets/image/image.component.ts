import { AfterViewInit, Component, ElementRef, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { decode } from 'blurhash';
import { AvatarSize } from '../avatar/avatar-size';
import { User } from 'src/app/models/user';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { Status } from 'src/app/models/status';
import { Attachment } from 'src/app/models/attachment';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { isPlatformBrowser } from '@angular/common';
import { delay, filter, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { SatPopoverComponent } from '@ncstate/sat-popover';
import { NavigationStart, Router } from '@angular/router';
import { Relationship } from 'src/app/models/relationship';
import { RelationshipsService } from 'src/app/services/http/relationships.service';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit, OnDestroy, AfterViewInit {
    readonly avatarSize = AvatarSize;

    @Input() horizontal = true;
    @Input() status?: Status;
    @Input() avatarVisible = true;

    @ViewChild('popover') popover?: SatPopoverComponent;
    mouseenter = new Subject<void>();
    mouseleave = new Subject<void>();
    routeNavigationStartSubscription?: Subscription;

    imageSrc = '';
    alt?: string;
    blurhash?: string;
    user?: User;
    relationship?: Relationship;
    signedInUser?: User;
    width = 0;
    height = 0;
    isBrowser = false;

    @ViewChild('canvas', { static: false }) readonly canvas?: ElementRef<HTMLCanvasElement>;

    showAltIcon = false;
    showFavourites = false;
    imageIsLoaded = false;

    get showAvatar() { return this.preferencesService.showAvatars && this.avatarVisible; }

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        private preferencesService: PreferencesService,
        private statusesService: StatusesService,
        private relationshipsService: RelationshipsService,
        private router: Router,
        private messageService: MessagesService,
        private authorizationService: AuthorizationService) {
            this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit(): void {
        this.imageSrc = this.getMainAttachmentSrc();
        this.alt = this.getMainAttachmentAlt();
        this.user = this.getMainStatus()?.user;
        this.blurhash = this.getMainAttachmentBlurhash();
        this.width = this.getMainAttachmentWidth();
        this.height = this.getMainAttachmentHeight();

        this.showAltIcon = this.preferencesService.showAltIcon;
        this.showFavourites = this.preferencesService.showFavourites;

        this.signedInUser = this.authorizationService.getUser();

        this.routeNavigationStartSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationStart))  
            .subscribe(() => {
                this.popover?.close();
                this.popover = undefined;
            });
    }

    ngOnDestroy(): void {
        this.popover?.close();
        this.routeNavigationStartSubscription?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.drawCanvas();

        this.mouseenter
            .pipe(switchMap(() => of(null).pipe(delay(500), takeUntil(this.mouseleave))))
            .subscribe(async () => {
                this.popover?.open();

                if (this.user && this.user.id && this.signedInUser?.id !== this.user.id) {
                    this.relationship = await this.relationshipsService.get(this.user.id);
                }
            });
  
        this.mouseleave
            .pipe(switchMap(() => of(null).pipe(delay(500), takeUntil(this.mouseenter))))
            .subscribe(() => {
                this.popover?.close();
            });
    }

    async favouriteToogle(): Promise<void> {
        const mainStatus = this.getMainStatus();

        if (mainStatus) {
            try {
                if (mainStatus.favourited) {
                    await this.statusesService.unfavourite(mainStatus.id);
                    mainStatus.favourited = false;
                    this.messageService.showSuccess('Status unfavourited.');
                } else {
                    await this.statusesService.favourite(mainStatus.id);
                    mainStatus.favourited = true;
                    this.messageService.showSuccess('Status favourited.');
                }
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            }
        }
    }

    onImageLoaded(): void {
        this.imageIsLoaded = true;
    }

    private drawCanvas(): void {
        if (!this.isBrowser) {
            return;
        }

        if (!this.blurhash) {
            return;
        }

        if (!this.canvas) {
            return;
        }

        const pixels = decode(this.blurhash, 32, 32);
        const ctx = this.canvas.nativeElement.getContext('2d');

        if (!ctx) {
            return;
        }

        const imageData = ctx.createImageData(32, 32);
        if (!imageData) {
            return;
        }

        imageData.data.set(pixels);
        ctx.putImageData(imageData!, 0, 0);
    }

    protected getMainStatus(): Status | undefined {
        return this.status?.reblog ?? this.status;
    }

    private getMainAttachmentSrc(): string {
        if (this.status) {
            const mainAttachment = this.getMainAttachment(this.status);
            return mainAttachment?.smallFile?.url ?? '';
        }

        return '';
    }

    private getMainAttachmentAlt(): string | undefined {
        if (this.status) {
            const mainAttachment = this.getMainAttachment(this.status);
            return mainAttachment?.description;
        }

        return undefined;
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

    getMainAttachmentBlurhash(): string {
        if (this.status) {
            const mainAttachment = this.getMainAttachment(this.status);
            return mainAttachment?.blurhash ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
        }

        return 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
    }

    getMainAttachmentWidth(): number {
        if (this.status) {
            const mainAttachment = this.getMainAttachment(this.status);
            return mainAttachment?.smallFile?.width ?? 0;
        }

        return 0;
    }

    getMainAttachmentHeight(): number {
        if (this.status) {
            const mainAttachment = this.getMainAttachment(this.status);
            return mainAttachment?.smallFile?.height ?? 0;
        }

        return 0;
    }
}
