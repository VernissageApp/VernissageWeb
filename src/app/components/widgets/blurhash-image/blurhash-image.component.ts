import { AfterViewInit, Component, ElementRef, Inject, Input, PLATFORM_ID, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { SatPopoverComponent } from '@ncstate/sat-popover';
import { delay, filter, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { Relationship } from 'src/app/models/relationship';
import { RelationshipsService } from 'src/app/services/http/relationships.service';

@Component({
    selector: 'app-blurhash-image',
    templateUrl: './blurhash-image.component.html',
    styleUrls: ['./blurhash-image.component.scss'],
    standalone: false
})
export class BlurhashImageComponent implements AfterViewInit, OnInit, OnDestroy {
    readonly avatarSize = AvatarSize;
    
    @Input() horizontal = true;
    @Input() status?: Status;
    @Input() avatarVisible = true;

    @ViewChild('popover') popover?: SatPopoverComponent;
    mouseenter = new Subject<void>();
    mouseleave = new Subject<void>();
    routeNavigationStartSubscription?: Subscription;

    imageSrc?: string;
    alt?: string;
    blurhash?: string;
    user?: User;
    relationship?: Relationship;
    text?: string;
    signedInUser?: User;
    isBrowser = false;
    
    @ViewChild('canvas', { static: false }) readonly canvas?: ElementRef<HTMLCanvasElement>;
    @ViewChild('img', { static: false }) readonly img?: ElementRef<HTMLImageElement>;

    showAltIcon = false;
    showFavourites = false;
    canvasIsLoaded = false;

    get showAvatar() { return this.preferencesService.showAvatars && this.avatarVisible; }

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        private preferencesService: PreferencesService,
        private statusesService: StatusesService,
        private messageService: MessagesService,
        private relationshipsService: RelationshipsService,
        private changeDetectorRef: ChangeDetectorRef,
        private router: Router,
        private authorizationService: AuthorizationService) {
            this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit(): void {
        this.imageSrc = this.getMainAttachmentSrc();
        this.alt = this.getMainAttachmentAlt();
        this.blurhash = this.getMainAttachmentBlurhash();
        this.user = this.getMainStatus()?.user;
        this.text = this.getMainStatus()?.contentWarning;

        this.showAltIcon = this.preferencesService.showAltIcon;
        this.showFavourites = this.preferencesService.showFavourites;

        this.signedInUser = this.authorizationService.getUser();

        this.routeNavigationStartSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationStart))  
            .subscribe(() => {
                this.popover?.close();
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

    async favouriteToggle(): Promise<void> {
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

        this.canvasIsLoaded = true;
        this.changeDetectorRef.detectChanges();
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
}
