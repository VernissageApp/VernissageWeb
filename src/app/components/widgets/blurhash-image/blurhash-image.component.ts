import { AfterViewInit, Component, ElementRef, Inject, PLATFORM_ID, OnInit, OnDestroy, input, computed, viewChild, signal, ChangeDetectionStrategy, effect } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class BlurhashImageComponent implements AfterViewInit, OnInit, OnDestroy {
    public avatarVisible = input(true);
    public horizontal = input(true);
    public status = input.required<Status>();

    protected readonly avatarSize = AvatarSize;
    protected mainStatus = computed(() => { return this.status()?.reblog ?? this.status(); });
    protected mouseenter = new Subject<void>();
    protected mouseleave = new Subject<void>();

    protected imageSrc = signal('');
    protected alt = signal<string | undefined>(undefined);
    protected user = signal<User | undefined>(undefined);
    protected relationship = signal<Relationship | undefined>(undefined);
    protected contentWarning = signal<string | undefined>(undefined);
    protected signedInUser = signal<User | undefined>(undefined);
    protected showAltIcon = signal(false);
    protected showFavourites = signal(false);
    protected showReblog = signal(false);
    protected showAvatar = signal(false);
    protected canvasIsLoaded = signal(false);
    protected isFavourited = signal(false);
    protected isReblogged = signal(false);

    private popover = viewChild<SatPopoverComponent | undefined>('popover');
    private canvas = viewChild<ElementRef<HTMLCanvasElement> | undefined>('canvas');

    private routeNavigationStartSubscription?: Subscription;
    private isBrowser = false;
    private blurhash = '';

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        private preferencesService: PreferencesService,
        private statusesService: StatusesService,
        private messageService: MessagesService,
        private relationshipsService: RelationshipsService,
        private router: Router,
        private authorizationService: AuthorizationService
    ) {
        this.isBrowser = isPlatformBrowser(platformId);

        effect(() => {
            this.showAvatar.set(this.preferencesService.showAvatars && this.avatarVisible());
        });
    }

    ngOnInit(): void {
        this.imageSrc.set(this.getMainAttachmentSrc());
        this.alt.set(this.getMainAttachmentAlt());
        this.user.set(this.mainStatus().user);
        this.isFavourited.set(this.mainStatus().favourited);
        this.isReblogged.set(this.mainStatus().reblogged);
        this.contentWarning.set(this.mainStatus().contentWarning);
        this.signedInUser.set(this.authorizationService.getUser());

        this.showAltIcon.set(this.preferencesService.showAltIcon);
        this.showFavourites.set(this.preferencesService.showFavourites);
        this.showReblog.set(this.preferencesService.showReblog);
        this.showAvatar.set(this.preferencesService.showAvatars && this.avatarVisible());

        this.blurhash = this.getMainAttachmentBlurhash();

        this.routeNavigationStartSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationStart))  
            .subscribe(() => {
                this.popover()?.close();
            });
    }

    ngOnDestroy(): void {
        this.popover()?.close();
        this.routeNavigationStartSubscription?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.drawCanvas();

        this.mouseenter
            .pipe(switchMap(() => of(null).pipe(delay(500), takeUntil(this.mouseleave))))
            .subscribe(async () => {
                this.popover()?.open();

                const userInternal = this.user();
                if (userInternal && userInternal.id && this.signedInUser()?.id !== userInternal.id) {
                    const downloadedRelationship = await this.relationshipsService.get(userInternal.id);
                    this.relationship.set(downloadedRelationship);
                }
            });
  
        this.mouseleave
            .pipe(switchMap(() => of(null).pipe(delay(500), takeUntil(this.mouseenter))))
            .subscribe(() => {
                this.popover()?.close();
            });
    }

    protected async favouriteToggle(): Promise<void> {
        try {
            if (this.isFavourited()) {
                await this.statusesService.unfavourite(this.mainStatus().id);
                this.isFavourited.set(false);
                this.messageService.showSuccess('Your like has been undone..');
            } else {
                await this.statusesService.favourite(this.mainStatus().id);
                this.isFavourited.set(true);
                this.messageService.showSuccess('Status favourited.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async reblogToggle(): Promise<void> {
        try {
            if (this.isFavourited()) {
                await this.statusesService.unreblog(this.mainStatus().id);
                this.isReblogged.set(false);
                this.messageService.showSuccess('Your boost has been undone.');
            } else {
                await this.statusesService.reblog(this.mainStatus().id);
                this.isReblogged.set(true);
                this.messageService.showSuccess('Status boosted.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    private drawCanvas(): void {
        if (!this.isBrowser) {
            return;
        }

        if (!this.blurhash) {
            return;
        }

        const internalCanvas = this.canvas();
        if (!internalCanvas) {
            return;
        }

        const pixels = decode(this.blurhash, 32, 32);
        const ctx = internalCanvas.nativeElement.getContext('2d');

        if (!ctx) {
            return;
        }

        const imageData = ctx.createImageData(32, 32);
        if (!imageData) {
            return;
        }

        imageData.data.set(pixels);
        ctx.putImageData(imageData!, 0, 0);

        this.canvasIsLoaded.set(true);
    }

    private getMainAttachmentSrc(): string {
        const mainAttachment = this.getMainAttachment();
        return mainAttachment?.smallFile?.url ?? '';
    }

    private getMainAttachmentAlt(): string | undefined {
        const mainAttachment = this.getMainAttachment();
        return mainAttachment?.description;
    }

    private getMainAttachmentBlurhash(): string {
        const mainAttachment = this.getMainAttachment();
        return mainAttachment?.blurhash ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
    }

    private getMainAttachment(): Attachment | null {
        const internalMainStatus = this.mainStatus();

        if (!internalMainStatus.attachments) {
            return null;
        }
    
        if (internalMainStatus.attachments?.length === 0) {
            return null;
        }

        return internalMainStatus.attachments[0];
    }
}
